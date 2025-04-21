# TrueBlue Social Product Detection Rules

A modular, extensible system for detecting and extracting product information from e-commerce websites. This repository contains rule definitions that power the TrueBlue Product Detector browser extension.

## Overview

The TrueBlue Product Detection Rules system uses a modular approach inspired by Bitcoin Improvement Proposals (BIPs). Each rule implementation is a TrueBlue Rule Proposal (TRP) with a unique identifier. This allows for an organized approach to adding support for new sites, platforms, and product categories.

### Key Features

- **Dynamic Rule Loading**: Rules are loaded at runtime based on the current domain
- **Modular Architecture**: Each site/platform has its own implementation
- **Extensible Design**: Easy to add support for new websites
- **Central Registry**: All implementations are tracked in a single registry file
- **Version Control**: Each implementation includes version information

## Repository Structure

```
trueblue-product-detection-rules/
├── trp-registry.json       # Central registry of all rule implementations
├── implementations/        # TRP implementations
│   ├── trp-1001/           # Amazon rules
│   │   └── index.js        # Implementation file
│   ├── trp-1002/           # Another site
│   │   └── index.js        
│   └── ...
├── test.html               # Test tool for rule implementations
└── README.md               # This file
```

## Getting Started

### Prerequisites

- A modern web browser
- Git (for cloning the repository)
- A local web server (required for testing)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/trueblue-product-detection-rules.git
   ```

2. **Important**: Set up a local web server to serve the files:
   
   Using Python (simplest option):
   ```
   cd trueblue-product-detection-rules
   python -m http.server 8000
   ```
   
   Using Node.js:
   ```
   npm install -g http-server
   cd trueblue-product-detection-rules
   http-server -p 8000
   ```
   
   Using PHP:
   ```
   cd trueblue-product-detection-rules
   php -S localhost:8000
   ```

3. Access the test tool through the local server:
   ```
   http://localhost:8000/test.html
   ```

> **Note**: You must use a local web server as described above. Opening the test.html file directly in your browser (using the file:// protocol) will not work due to browser security restrictions that prevent loading local JavaScript files and making fetch requests.

## Usage

### Testing Rules

1. Start your local web server as described in the Installation section
2. Open `http://localhost:8000/test.html` in your browser
3. Enter a domain (e.g., `amazon.com`)
4. Click "Test Domain" to see the rules that would be applied for that domain 
   ```


### Understanding Rule Structure

Each implementation file (e.g., `implementations/trp-1001/index.js`) has the following structure:

```javascript
return {
  _meta: {
    "trp": "1001",              // TRP identifier
    "name": "Amazon",           // Site/platform name
    "version": "1.0.0",         // Version of this implementation
    "domains": ["amazon.com"],  // Domains this applies to
    "type": "site-specific",    // Type of implementation
    "status": "active",         // Status
    "author": "TrueBlue",       // Author
    "lastUpdated": "2025-04-21" // Last update date
  },
  
  // Detection rules to identify product pages
  productPageRules: [
    // Rules to determine if a page is a product page
  ],
  
  // Extraction rules for product attributes
  attributes: {
    title: [
      // Rules to extract product title
    ],
    price: [
      // Rules to extract product price
    ],
    // Other attributes...
  },
  
  // Required attributes for valid detection
  requiredAttributes: ["title", "price"]
};
```

## Adding a New Implementation

### Step 1: Choose a TRP Number

- TRPs 1001-1999: Site-specific implementations
- TRPs 2001-2999: E-commerce platform implementations
- TRPs 3001-3999: Category-specific implementations

### Step 2: Create Directory Structure

```
implementations/trp-XXXX/index.js
```

### Step 3: Create Implementation File

Create your implementation file based on the template above, customizing the rules for your specific site.

### Step 4: Update Registry

Add your implementation to the `trp-registry.json` file:

```json
{
  "implementations": [
    {
      "trp": "XXXX",
      "name": "Your Site Name",
      "version": "1.0.0",
      "domains": ["yoursite.com"],
      "type": "site-specific",
      "status": "active",
      "author": "Your Name",
      "lastUpdated": "YYYY-MM-DD",
      "path": "implementations/trp-XXXX/index.js"
    }
  ]
}
```

### Step 5: Test Your Implementation

Use the test.html tool to verify your implementation works correctly.

## Rule Types

### Product Page Detection Rules

| Rule Type | Description | Example |
|-----------|-------------|---------|
| `urlPattern` | Regex pattern to match URL | `{ type: "urlPattern", pattern: "/product/" }` |
| `cssSelector` | CSS selector that must exist | `{ type: "cssSelector", selector: ".product-title" }` |
| `textContent` | Text that must exist on page | `{ type: "textContent", text: "add to cart" }` |
| `multiMatch` | Multiple conditions (AND) | `{ type: "multiMatch", conditions: [...] }` |
| `javascript` | Custom JS evaluation | `{ type: "javascript", code: "..." }` |

### Attribute Extraction Rules

| Rule Type | Description | Example |
|-----------|-------------|---------|
| `css` | Extract using CSS selector | `{ type: "css", selector: ".price" }` |
| `regex` | Extract using regex | `{ type: "regex", pattern: "\\$([0-9.]+)", group: 1 }` |
| `jsonld` | Extract from JSON-LD data | `{ type: "jsonld", path: "offers.price" }` |
| `javascript` | Extract using custom JS | `{ type: "javascript", code: "..." }` |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-site-support`)
3. Commit your changes (`git commit -am 'Add support for NewSite'`)
4. Push to the branch (`git push origin feature/new-site-support`)
5. Create a new Pull Request

## Contact

TrueBlue Social - [website](trueblue.social.reviews@gmail.com) - trueblue.social.reviews@gmail.com

## Acknowledgments

- Inspired by the Bitcoin Improvement Proposals (BIPs) system
- Thanks to all contributors who have helped add support for various e-commerce sites
