/*
  Q-Analysis Engine
  =================
  Implements the standard Q-methodology factor analysis pipeline:
  1. Correlation matrix (between persons, not variables)
  2. PCA factor extraction
  3. Varimax rotation
  4. Factor loadings + auto-flagging
  5. Weighted factor scores (composite Q-sorts)
  6. Distinguishing & consensus statements

  All computation runs client-side — no server needed.
*/

// ============================================================
// 1. DATA PREPARATION
// ============================================================

/**
 * Build the data matrix from responses.
 * Rows = statements, Columns = participants.
 * Each cell = the score the participant gave that statement.
 *
 * @param {Array} statements - [{id, text}, ...]
 * @param {Array} responses  - [{sortResult: {stmtId: score}, ...}, ...]
 * @returns {number[][]} matrix[stmt_index][participant_index]
 */
export function buildDataMatrix(statements, responses) {
  return statements.map(stmt =>
    responses.map(r => r.sortResult[stmt.id] ?? 0)
  )
}

// ============================================================
// 2. CORRELATION MATRIX (person × person)
// ============================================================

/**
 * Compute Pearson correlation matrix between participants.
 * In Q-methodology, we correlate persons (columns), not variables (rows).
 *
 * @param {number[][]} matrix - [statements][participants]
 * @returns {number[][]} correlation matrix [p][q]
 */
export function correlationMatrix(matrix) {
  const nStmt = matrix.length
  const nPart = matrix[0].length

  // Compute column means and std devs
  const means = []
  const stds = []
  for (let j = 0; j < nPart; j++) {
    let sum = 0
    for (let i = 0; i < nStmt; i++) sum += matrix[i][j]
    const mean = sum / nStmt
    means.push(mean)

    let ssq = 0
    for (let i = 0; i < nStmt; i++) ssq += (matrix[i][j] - mean) ** 2
    stds.push(Math.sqrt(ssq / nStmt))
  }

  // Correlation matrix
  const corr = Array.from({ length: nPart }, () => new Array(nPart).fill(0))
  for (let a = 0; a < nPart; a++) {
    corr[a][a] = 1.0
    for (let b = a + 1; b < nPart; b++) {
      let cov = 0
      for (let i = 0; i < nStmt; i++) {
        cov += (matrix[i][a] - means[a]) * (matrix[i][b] - means[b])
      }
      cov /= nStmt
      const r = (stds[a] > 0 && stds[b] > 0) ? cov / (stds[a] * stds[b]) : 0
      corr[a][b] = r
      corr[b][a] = r
    }
  }

  return corr
}

// ============================================================
// 3. EIGENVALUE DECOMPOSITION (for PCA)
// ============================================================

/**
 * Compute eigenvalues and eigenvectors of a symmetric matrix
 * using the Jacobi iterative method.
 *
 * @param {number[][]} A - symmetric matrix (will be copied)
 * @returns {{ values: number[], vectors: number[][] }}
 */
function jacobiEigen(A) {
  const n = A.length
  const maxIter = 100 * n * n
  const tol = 1e-12

  // Work on a copy
  const S = A.map(row => [...row])
  // Eigenvectors start as identity
  const V = Array.from({ length: n }, (_, i) => {
    const row = new Array(n).fill(0)
    row[i] = 1
    return row
  })

  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal element
    let maxVal = 0
    let p = 0
    let q = 1
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(S[i][j]) > maxVal) {
          maxVal = Math.abs(S[i][j])
          p = i
          q = j
        }
      }
    }

    if (maxVal < tol) break

    // Compute rotation angle
    const theta =
      Math.abs(S[p][p] - S[q][q]) < tol
        ? Math.PI / 4
        : 0.5 * Math.atan2(2 * S[p][q], S[p][p] - S[q][q])

    const c = Math.cos(theta)
    const s = Math.sin(theta)

    // Rotate S
    const Spp = c * c * S[p][p] + 2 * s * c * S[p][q] + s * s * S[q][q]
    const Sqq = s * s * S[p][p] - 2 * s * c * S[p][q] + c * c * S[q][q]

    S[p][p] = Spp
    S[q][q] = Sqq
    S[p][q] = 0
    S[q][p] = 0

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Sip = c * S[i][p] + s * S[i][q]
        const Siq = -s * S[i][p] + c * S[i][q]
        S[i][p] = Sip
        S[p][i] = Sip
        S[i][q] = Siq
        S[q][i] = Siq
      }
    }

    // Rotate eigenvectors
    for (let i = 0; i < n; i++) {
      const Vip = c * V[i][p] + s * V[i][q]
      const Viq = -s * V[i][p] + c * V[i][q]
      V[i][p] = Vip
      V[i][q] = Viq
    }
  }

  // Extract eigenvalues
  const values = []
  for (let i = 0; i < n; i++) values.push(S[i][i])

  // Sort by eigenvalue descending
  const indices = values.map((_, i) => i)
  indices.sort((a, b) => values[b] - values[a])

  return {
    values: indices.map(i => values[i]),
    vectors: indices.map(i => V.map(row => row[i])),
    // vectors[k] = k-th eigenvector as column (array of n elements)
  }
}

// ============================================================
// 4. PCA FACTOR EXTRACTION
// ============================================================

/**
 * Extract unrotated factor loadings via PCA.
 *
 * @param {number[][]} corr - correlation matrix [n×n]
 * @param {number} nFactors - number of factors to extract
 * @returns {{ loadings: number[][], eigenvalues: number[], explainedVariance: number[] }}
 *   loadings[participant][factor]
 */
export function extractFactors(corr, nFactors) {
  const { values, vectors } = jacobiEigen(corr)
  const n = corr.length

  // Loadings = eigenvector × sqrt(eigenvalue)
  const loadings = []
  for (let i = 0; i < n; i++) {
    const row = []
    for (let f = 0; f < nFactors; f++) {
      const ev = Math.max(values[f], 0)
      row.push(vectors[f][i] * Math.sqrt(ev))
    }
    loadings.push(row)
  }

  const totalVar = values.reduce((a, b) => a + Math.max(b, 0), 0)
  const explainedVariance = values.slice(0, nFactors).map(v => Math.max(v, 0) / totalVar)

  return { loadings, eigenvalues: values, explainedVariance }
}

// ============================================================
// 5. VARIMAX ROTATION
// ============================================================

/**
 * Varimax rotation of a loading matrix.
 *
 * @param {number[][]} loadings - [n × k] loading matrix
 * @param {number} maxIter
 * @param {number} tol
 * @returns {number[][]} rotated loadings [n × k]
 */
export function varimaxRotation(loadings, maxIter = 1000, tol = 1e-6) {
  const n = loadings.length
  const k = loadings[0].length

  if (k < 2) return loadings.map(row => [...row])

  // Work on a copy
  let L = loadings.map(row => [...row])

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false

    // Rotate each pair of factors
    for (let p = 0; p < k; p++) {
      for (let q = p + 1; q < k; q++) {
        // Compute rotation angle per varimax criterion
        let A = 0, B = 0, C = 0, D = 0
        for (let i = 0; i < n; i++) {
          const u = L[i][p] * L[i][p] - L[i][q] * L[i][q]
          const v = 2 * L[i][p] * L[i][q]
          A += u
          B += v
          C += u * u - v * v
          D += 2 * u * v
        }

        const num = D - 2 * A * B / n
        const den = C - (A * A - B * B) / n
        const phi = 0.25 * Math.atan2(num, den)

        if (Math.abs(phi) < tol) continue
        changed = true

        const cos = Math.cos(phi)
        const sin = Math.sin(phi)

        for (let i = 0; i < n; i++) {
          const lp = L[i][p]
          const lq = L[i][q]
          L[i][p] = cos * lp + sin * lq
          L[i][q] = -sin * lp + cos * lq
        }
      }
    }

    if (!changed) break
  }

  return L
}

// ============================================================
// 6. AUTO-FLAGGING
// ============================================================

/**
 * Auto-flag participants for each factor using standard criteria:
 *   1. Loading is significant: |loading| > 1.96 / sqrt(nStatements)
 *   2. Loading squared on this factor > loading squared on any other factor
 *
 * @param {number[][]} loadings - rotated loadings [participant × factor]
 * @param {number} nStatements
 * @returns {boolean[][]} flags[participant][factor]
 */
export function autoFlag(loadings, nStatements) {
  const threshold = 1.96 / Math.sqrt(nStatements)
  const nPart = loadings.length
  const nFactors = loadings[0].length

  return loadings.map(row => {
    // Find which factor this person loads most strongly on
    const absLoadings = row.map(v => Math.abs(v))
    const maxIdx = absLoadings.indexOf(Math.max(...absLoadings))

    return row.map((v, f) => {
      // Significant on this factor?
      if (Math.abs(v) < threshold) return false
      // Loads highest on this factor?
      if (f !== maxIdx) return false
      // Loading squared must be > 50% of communality (sum of squared loadings)
      const h2 = row.reduce((s, x) => s + x * x, 0)
      return h2 > 0 && (v * v / h2) > 0.5
    })
  })
}

// ============================================================
// 7. FACTOR SCORES (composite Q-sorts)
// ============================================================

/**
 * Compute factor scores — the ideal/composite Q-sort for each factor.
 * Uses the weighted averaging method (Brown, 1980):
 *   weight_i = loading_i / (1 - loading_i^2)  for flagged participants
 *   factor_score_s = sum(w_i * score_si) / sum(w_i)
 *
 * The raw weighted averages are then converted to z-scores for comparison.
 *
 * @param {number[][]} dataMatrix - [statements][participants]
 * @param {number[][]} loadings - rotated loadings [participant × factor]
 * @param {boolean[][]} flags - [participant × factor]
 * @returns {{ zScores: number[][], rankings: number[][] }}
 *   zScores[statement][factor], rankings[statement][factor]
 */
export function computeFactorScores(dataMatrix, loadings, flags) {
  const nStmt = dataMatrix.length
  const nFactors = loadings[0].length

  const zScores = Array.from({ length: nStmt }, () => new Array(nFactors).fill(0))

  for (let f = 0; f < nFactors; f++) {
    // Identify flagged participants and their weights
    const weights = []
    const indices = []
    for (let p = 0; p < loadings.length; p++) {
      if (flags[p][f]) {
        const l = loadings[p][f]
        const w = l / (1 - l * l + 1e-10) // avoid division by zero
        weights.push(w)
        indices.push(p)
      }
    }

    if (weights.length === 0) continue

    const totalW = weights.reduce((a, b) => a + Math.abs(b), 0)

    // Weighted average for each statement
    const rawScores = []
    for (let s = 0; s < nStmt; s++) {
      let wSum = 0
      for (let wi = 0; wi < weights.length; wi++) {
        wSum += weights[wi] * dataMatrix[s][indices[wi]]
      }
      rawScores.push(totalW > 0 ? wSum / totalW : 0)
    }

    // Convert to z-scores
    const mean = rawScores.reduce((a, b) => a + b, 0) / nStmt
    const std = Math.sqrt(rawScores.reduce((s, v) => s + (v - mean) ** 2, 0) / nStmt) || 1
    for (let s = 0; s < nStmt; s++) {
      zScores[s][f] = (rawScores[s] - mean) / std
    }
  }

  // Rankings (1 = most positive, nStmt = most negative)
  const rankings = Array.from({ length: nStmt }, () => new Array(nFactors).fill(0))
  for (let f = 0; f < nFactors; f++) {
    const sortedIdx = Array.from({ length: nStmt }, (_, i) => i)
    sortedIdx.sort((a, b) => zScores[b][f] - zScores[a][f])
    sortedIdx.forEach((idx, rank) => {
      rankings[idx][f] = rank + 1
    })
  }

  return { zScores, rankings }
}

// ============================================================
// 8. DISTINGUISHING & CONSENSUS STATEMENTS
// ============================================================

/**
 * Identify distinguishing and consensus statements.
 *
 * A statement is "distinguishing" for a factor if its z-score on that factor
 * differs significantly from its z-score on all other factors.
 *
 * A statement is "consensus" if its z-scores are similar across all factors.
 *
 * @param {number[][]} zScores - [statement][factor]
 * @param {number} nStatements
 * @param {number[][]} flags - for computing SE
 * @returns {{ distinguishing: {stmtIdx: number, factorIdx: number, zDiff: number}[], consensus: number[] }}
 */
export function identifyStatements(zScores, nStatements, flags) {
  const nFactors = zScores[0].length
  const threshold = 1.0 // z-score difference threshold for distinguishing

  const distinguishing = []
  const consensus = []

  for (let s = 0; s < nStatements; s++) {
    const scores = zScores[s]
    const maxDiff = maxPairwiseDiff(scores)

    if (maxDiff < threshold) {
      consensus.push(s)
    } else {
      // Which factor is this statement most distinguishing for?
      for (let f = 0; f < nFactors; f++) {
        const otherScores = scores.filter((_, i) => i !== f)
        const avgOther = otherScores.reduce((a, b) => a + b, 0) / (otherScores.length || 1)
        const diff = scores[f] - avgOther
        if (Math.abs(diff) >= threshold) {
          distinguishing.push({ stmtIdx: s, factorIdx: f, zDiff: diff })
        }
      }
    }
  }

  return { distinguishing, consensus }
}

function maxPairwiseDiff(arr) {
  let maxD = 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      maxD = Math.max(maxD, Math.abs(arr[i] - arr[j]))
    }
  }
  return maxD
}

// ============================================================
// 9. HIGH-LEVEL ANALYSIS RUNNER
// ============================================================

/**
 * Run the full Q-analysis pipeline.
 *
 * @param {Array} statements - [{id, text}, ...]
 * @param {Array} responses  - [{sortResult: {stmtId: score}, ...}, ...]
 * @param {number} nFactors  - number of factors to extract (default: auto)
 * @returns {object} Full analysis results
 */
export function runAnalysis(statements, responses, nFactors = null) {
  if (responses.length < 2) {
    throw new Error('At least 2 responses are required for Q-analysis')
  }

  // 1. Build data matrix
  const dataMatrix = buildDataMatrix(statements, responses)

  // 2. Correlation matrix
  const corr = correlationMatrix(dataMatrix)

  // 3. Auto-select number of factors if not specified (Kaiser criterion: eigenvalue > 1)
  const { values: allEigenvalues } = jacobiEigen(corr)
  if (!nFactors) {
    nFactors = allEigenvalues.filter(v => v > 1).length
    nFactors = Math.max(2, Math.min(nFactors, 7, Math.floor(responses.length / 2)))
  }

  // 4. Extract factors
  const { loadings: unrotated, eigenvalues, explainedVariance } = extractFactors(corr, nFactors)

  // 5. Varimax rotation
  const rotatedLoadings = varimaxRotation(unrotated)

  // 6. Auto-flag
  const flags = autoFlag(rotatedLoadings, statements.length)

  // 7. Factor scores
  const { zScores, rankings } = computeFactorScores(dataMatrix, rotatedLoadings, flags)

  // 8. Distinguishing & consensus statements
  const { distinguishing, consensus } = identifyStatements(zScores, statements.length, flags)

  // 9. Compute explained variance for rotated solution
  const rotatedExplVar = []
  for (let f = 0; f < nFactors; f++) {
    let ss = 0
    for (let i = 0; i < rotatedLoadings.length; i++) {
      ss += rotatedLoadings[i][f] ** 2
    }
    rotatedExplVar.push(ss / rotatedLoadings.length)
  }

  return {
    nFactors,
    dataMatrix,
    correlationMatrix: corr,
    eigenvalues: allEigenvalues,
    unrotatedLoadings: unrotated,
    rotatedLoadings,
    explainedVariance: rotatedExplVar,
    flags,
    zScores,
    rankings,
    distinguishing,
    consensus,
  }
}
