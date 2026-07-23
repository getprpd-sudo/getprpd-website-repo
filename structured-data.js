(() => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://getprpd.com/#organization',
        name: 'PRPD',
        alternateName: 'Prepped',
        url: 'https://getprpd.com/',
        logo: 'https://getprpd.com/assets/images/favicon-512.png',
        email: 'getprpd@gmail.com',
        telephone: '+1-469-545-0781',
        description: 'DFW halal high-protein custom meal prep delivered fresh weekly.',
        areaServed: {
          '@type': 'Place',
          name: 'Dallas-Fort Worth metroplex',
        },
        sameAs: [
          'https://instagram.com/getprpd',
          'https://www.tiktok.com/@getprpd',
          'https://www.youtube.com/@getprpd',
          'https://www.facebook.com/profile.php?id=61555781940379',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://getprpd.com/#website',
        url: 'https://getprpd.com/',
        name: 'PRPD',
        publisher: {
          '@id': 'https://getprpd.com/#organization',
        },
      },
    ],
  };

  const element = document.createElement('script');
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(structuredData);
  document.head.appendChild(element);
})();
