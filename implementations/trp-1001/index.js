/**
 * Amazon-specific scraping rules
 */

return {
  _meta: {
    "trp": "1001",
    "name": "Amazon",
    "version": "1.0.0",
    "domains": ["amazon.com", "amazon.co.uk", "amazon.de", "amazon.ca"],
    "type": "site-specific",
    "status": "active",
    "author": "TrueBlue",
    "lastUpdated": "2025-04-21"
  },
  
  // Amazon-specific product page detection rules
  productPageRules: [
    { 
      type: "urlPattern", 
      pattern: "/dp/[A-Z0-9]{10}" 
    },
    { 
      type: "multiMatch", 
      conditions: [
        { type: "cssSelector", selector: "#productTitle" },
        { type: "cssSelector", selector: "#corePriceDisplay_desktop_feature_div, #corePrice_feature_div" }
      ]
    }
  ],
  
  // Amazon-specific attribute extractors
  attributes: {
    title: [
      { type: "css", selector: "#productTitle" }
    ],
    price: [
      { type: "css", selector: ".a-price .a-offscreen" },
      { type: "css", selector: "#priceblock_ourprice" },
      { type: "css", selector: "#priceblock_dealprice" },
      {
        type: "javascript",
        code: `
          // Try to extract price from various locations
          try {
            // Main price selectors
            let priceSelectors = [
              '.a-price .a-offscreen',
              '#priceblock_ourprice',
              '#priceblock_dealprice',
              '.a-color-price',
              '.priceToPay .a-offscreen'
            ];
            
            for (let selector of priceSelectors) {
              const element = document.querySelector(selector);
              if (element && element.textContent.trim()) {
                return element.textContent.trim();
              }
            }
            
            // Try regex pattern for price on the page
            const pageText = document.body.textContent;
            const priceMatch = pageText.match(/\\$\\s?(\\d+(?:\\.\\d{2})?)/);
            if (priceMatch && priceMatch[1]) {
              return '$' + priceMatch[1];
            }
            
            return null;
          } catch (e) {
            return null;
          }
        `
      }
    ],
    originalPrice: [
      { type: "css", selector: ".a-text-price .a-offscreen" },
      { type: "css", selector: "#listPrice" },
      { type: "css", selector: "#priceblock_listprice" }
    ],
    rating: [
      { 
        type: "regex", 
        pattern: "([0-9]\\.[0-9]) out of 5 stars", 
        group: 1,
        source: "#averageCustomerReviews"
      },
      { type: "css", selector: ".a-icon-star .a-icon-alt" }
    ],
    reviewCount: [
      { 
        type: "regex", 
        pattern: "([\\d,]+) ratings", 
        group: 1,
        source: "#acrCustomerReviewText"
      }
    ],
    availability: [
      { type: "css", selector: "#availability span" },
      { type: "css", selector: "#deliveryMessageMirId" }
    ],
    description: [
      { type: "css", selector: "#productDescription p" },
      { type: "css", selector: "#feature-bullets .a-list-item" },
      {
        type: "javascript",
        code: `
          // Combine product description and bullet points
          try {
            let description = '';
            
            // Product description
            const productDesc = document.querySelector('#productDescription p');
            if (productDesc) {
              description += productDesc.textContent.trim() + '\\n\\n';
            }
            
            // Bullet points
            const bullets = Array.from(document.querySelectorAll('#feature-bullets .a-list-item'));
            if (bullets.length > 0) {
              description += bullets.map(b => '• ' + b.textContent.trim()).join('\\n');
            }
            
            return description.trim() || null;
          } catch (e) {
            return null;
          }
        `
      }
    ],
    brand: [
      { type: "css", selector: "#bylineInfo" },
      { type: "css", selector: "#brand" },
      { type: "css", selector: ".po-brand .a-span9" }
    ],
    images: [
      {
        type: "javascript",
        code: `
          // Extract Amazon image gallery
          try {
            // First try to get from data model
            const imageElementsScript = Array.from(document.querySelectorAll('script:not([src])'))
              .find(script => script.textContent.includes('colorImages') && script.textContent.includes('initial'));
            
            if (imageElementsScript) {
              const match = imageElementsScript.textContent.match(/'colorImages'\\s*:\\s*{\\s*'initial'\\s*:\\s*(\\[.+?\\])\\s*}/s);
              if (match && match[1]) {
                const imageData = JSON.parse(match[1]);
                return imageData.map(img => img.hiRes || img.large || img.thumb)
                  .filter(url => url && !url.includes('x-locale/common/transparent-pixel'));
              }
            }
            
            // Fallback to direct image elements
            const imageElements = document.querySelectorAll('#imgTagWrapperId img, #imageBlock img, #main-image, .imgTagWrapper img');
            if (imageElements.length > 0) {
              return Array.from(imageElements)
                .map(img => img.src)
                .filter(src => src && !src.includes('transparent-pixel') && !src.includes('gif'))
                .filter((src, i, arr) => arr.indexOf(src) === i); // Deduplicate
            }
            
            return null;
          } catch (e) {
            return null;
          }
        `
      }
    ],
    dimensions: [
      { type: "css", selector: "#productDetails_detailBullets_sections1 tr:has(th:contains('Dimensions')) td" },
      { type: "css", selector: ".po-dimensions .a-span9" }
    ],
    weight: [
      { type: "css", selector: "#productDetails_detailBullets_sections1 tr:has(th:contains('Weight')) td" },
      { type: "css", selector: ".po-item_weight .a-span9" }
    ],
    asin: [
      { type: "css", selector: "#ASIN, input[name='ASIN']", attribute: "value" },
      {
        type: "javascript",
        code: `
          // Extract ASIN from URL
          try {
            const match = location.pathname.match(/\\/dp\\/([A-Z0-9]{10})/);
            return match ? match[1] : null;
          } catch (e) {
            return null;
          }
        `
      }
    ],
    variants: [
      {
        type: "javascript",
        code: `
          // Extract variants from twister data
          try {
            const twisters = document.querySelectorAll('#twister_feature_div .a-row');
            if (twisters.length === 0) return null;
            
            const variants = {};
            
            twisters.forEach(twister => {
              const label = twister.querySelector('.a-form-label');
              if (!label) return;
              
              const variantName = label.textContent.trim();
              const options = Array.from(twister.querySelectorAll('li[data-defaultasin], option'))
                .map(option => option.textContent.trim())
                .filter(text => text);
              
              if (options.length > 0) {
                variants[variantName] = options;
              }
            });
            
            return Object.keys(variants).length > 0 ? variants : null;
          } catch (e) {
            return null;
          }
        `
      }
    ]
  },
  
  // Required attributes for Amazon
  requiredAttributes: ["title", "asin"]
};