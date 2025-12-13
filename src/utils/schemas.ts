export interface OrganizationSchemaConfig {
  name: string;
  url: string;
  logo: string;
  description: string;
  telephone?: string;
  email?: string;
  socialMedia?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

export function generateOrganizationSchema(config: OrganizationSchemaConfig) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.name,
    "url": config.url,
    "logo": config.logo,
    "description": config.description,
    "sameAs": config.socialMedia || [],
  };

  if (config.telephone) schema.telephone = config.telephone;
  if (config.email) schema.email = config.email;

  // Future-ready para LocalBusiness cuando tengan ubicación física
  if (config.address) {
    schema["@type"] = "LocalBusiness";
    schema.address = {
      "@type": "PostalAddress",
      ...config.address
    };
  }

  return schema;
}

export function generateServiceSchema(serviceName: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": serviceName,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": "GVoltsCorp",
      "url": "https://www.gvoltscorp.com"
    },
    "url": url,
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    }
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
