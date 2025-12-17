# Contentstack Content Type JSON Files

This directory contains JSON files for importing content types into Contentstack.

## Files

- `faq-content-type.json` - FAQ entry content type (for individual FAQ items)
- `faqs-page-content-type.json` - FAQs page content type (for the FAQ listing page with hero banner and sections)
- `hero-banner-content-type.json` - Hero banner component content type
- `section-with-cards-content-type.json` - Section with cards component content type

## How to Import

### Method 1: Using Contentstack UI

1. Log in to your Contentstack account
2. Navigate to **Settings** → **Content Types**
3. Click **Import** button
4. Select the JSON file
5. Review and confirm the import

### Method 2: Using Contentstack Management API

```bash
# Using curl
curl -X POST \
  'https://api.contentstack.io/v3/content_types' \
  -H 'authtoken: YOUR_MANAGEMENT_TOKEN' \
  -H 'api_key: YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d @faq-content-type.json
```

### Method 3: Using Contentstack CLI

```bash
# Install Contentstack CLI
npm install -g @contentstack/cli

# Login
csdx auth:login

# Import content type
csdx cm:stacks:import --file faq-content-type.json
```

## Content Type Structure

Each JSON file follows Contentstack's content type schema format:

- **schema**: Array of field definitions
- **options**: Content type configuration (title pattern, URL pattern, etc.)
- **DEFAULT_ACL**: Default access control list
- **SYS_ACL**: System access control list

## Field Types Used

- **text**: Single line text input
- **richtext**: Rich text editor with formatting options
- **reference**: Reference to another content type
- **tags**: Tag field for categorization
- **boolean**: True/false checkbox
- **number**: Numeric input
- **json**: JSON data field

## Notes

- Update the `DEFAULT_ACL` section with your actual user/role UIDs
- Adjust `url_pattern` and `url_prefix` as needed for your site structure
- The `_version` field will be automatically managed by Contentstack
- `created_at` and `updated_at` will be set automatically on import

## Import Order

If importing multiple content types, import them in this order:

1. `hero-banner-content-type.json` (component)
2. `section-with-cards-content-type.json` (component)
3. `faq-content-type.json` (entry content type)
4. `faqs-page-content-type.json` (page content type - references the components and FAQ entries)

This ensures that referenced content types exist before importing content types that reference them.

## Customization

Before importing, you may want to customize:

1. **User/Role UIDs** in `DEFAULT_ACL` and `SYS_ACL`
2. **URL patterns** in `options.url_pattern`
3. **Field validations** in `field_metadata.validation`
4. **Default values** in `field_metadata.default_value`

