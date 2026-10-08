// Public identity and page metadata, shared with the browser. Keep secrets out of this module.
export const MAINTAINER = {
  name: 'Berent Tevfik Barış',
  orcid: 'https://orcid.org/0009-0002-8902-7869',
}

export const HOME_METADATA = {
  title: 'Q-Method — Free Online Q-Methodology Tool for Researchers',
  description: 'Create and run Q-studies online for free. No accounts, no installs, no fees.',
  url: 'https://qmethod.polia.nl/',
}

export const ABOUT_METADATA = {
  title: 'About Q-Method — Maintainer, Data Handling & Research Citation',
  description: 'Meet Q-Method maintainer Berent Tevfik Barış, learn how study data is handled, cite the tool, and review the implemented analysis methods and limitations.',
  url: 'https://qmethod.polia.nl/about',
}

export const ABOUT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: ABOUT_METADATA.title,
  description: ABOUT_METADATA.description,
  url: ABOUT_METADATA.url,
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'Q-Method',
    url: HOME_METADATA.url,
    applicationCategory: 'Research software',
    operatingSystem: 'Web browser',
    maintainer: {
      '@type': 'Person',
      name: MAINTAINER.name,
      sameAs: MAINTAINER.orcid,
    },
  },
}

// Serve matching metadata before React loads, including for link-preview crawlers.
export function renderAboutHtml(html) {
  const { title, description, url } = ABOUT_METADATA
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*("\s*\/?>)/, `$1${description}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/(<meta (?:property|name)="(?:og:title|twitter:title)" content=")[^"]*("\s*\/?>)/g, `$1${title}$2`)
    .replace(/(<meta (?:property|name)="(?:og:description|twitter:description)" content=")[^"]*("\s*\/?>)/g, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*("\s*\/?>)/, `$1${url}$2`)
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace('</head>', `<script id="about-schema" type="application/ld+json">${JSON.stringify(ABOUT_SCHEMA)}</script>\n  </head>`)
}
