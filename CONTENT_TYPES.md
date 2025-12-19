# Contentstack Content Types Schema

This document describes the content types that need to be created in Contentstack for the Knowledge Portal.

## 1. Documentation Content Type

**UID:** `documentation`

### Fields:

- **title** (Single Line Textbox)
  - Required: Yes
  - Unique: Yes
  - Validation: Min 3 characters, Max 200 characters

- **description** (Textarea)
  - Required: No
  - Max length: 500 characters

- **content** (Rich Text Editor)
  - Required: Yes
  - Allowed modules: Paragraph, Heading, List, Link, Image, Code Block, Table, Blockquote

- **version** (Single Line Textbox)
  - Required: Yes
  - Default: "1.0"
  - Validation: Pattern `^\d+\.\d+$` (e.g., "1.0", "2.0", "3.0")

- **category** (Reference - Single)
  - Required: Yes
  - Reference to: `category` content type
  - Multiple: No

- **related_docs** (Reference - Multiple)
  - Required: No
  - Reference to: `documentation` content type
  - Multiple: Yes

- **tags** (Tags)
  - Required: No
  - Multiple: Yes

- **is_published** (Boolean)
  - Required: Yes
  - Default: false

- **access_roles** (JSON)
  - Required: No
  - Default: `["viewer", "editor", "admin"]`
  - Description: Array of roles that can access this documentation

### Entry Title Pattern:
`{{title}} - v{{version}}`

---

## 2. FAQ Content Type

**UID:** `faqs`

### Fields:

- **question** (Single Line Textbox)
  - Required: Yes
  - Unique: Yes
  - Validation: Min 10 characters, Max 200 characters

- **answer** (Rich Text Editor)
  - Required: Yes
  - Allowed modules: Paragraph, Heading, List, Link, Image, Code Block

- **category** (Reference - Single)
  - Required: Yes
  - Reference to: `category` content type
  - Multiple: No

- **tags** (Tags)
  - Required: No
  - Multiple: Yes

- **is_featured** (Boolean)
  - Required: No
  - Default: false
  - Description: Mark frequently asked questions

- **view_count** (Number)
  - Required: No
  - Default: 0
  - Description: Track how many times FAQs is viewed

- **access_roles** (JSON)
  - Required: No
  - Default: `["viewer", "editor", "admin", "guest"]`

### Entry Title Pattern:
`{{question}}`

---

## 3. Category Content Type

**UID:** `category`

### Fields:

- **title** (Single Line Textbox)
  - Required: Yes
  - Unique: Yes
  - Validation: Min 2 characters, Max 100 characters

- **description** (Textarea)
  - Required: No
  - Max length: 300 characters

- **slug** (Single Line Textbox)
  - Required: Yes
  - Unique: Yes
  - Validation: Lowercase, alphanumeric and hyphens only

- **icon** (File - Image)
  - Required: No
  - Allowed file types: jpg, png, svg
  - Max file size: 2MB

- **order** (Number)
  - Required: No
  - Default: 0
  - Description: For sorting categories

### Entry Title Pattern:
`{{title}}`

---

## 4. Feedback Content Type

**UID:** `feedback`

### Fields:

- **content_uid** (Single Line Textbox)
  - Required: Yes
  - Description: UID of the content being reviewed

- **content_type** (Single Line Textbox)
  - Required: Yes
  - Validation: Must be "documentation" or "faqs"

- **rating** (Number)
  - Required: Yes
  - Validation: Min 1, Max 5

- **comment** (Textarea)
  - Required: No
  - Max length: 1000 characters

- **user_email** (Single Line Textbox)
  - Required: No
  - Validation: Email format

- **user_role** (Single Line Textbox)
  - Required: No
  - Validation: Must be one of: "admin", "editor", "viewer", "guest"

- **status** (Single Line Textbox)
  - Required: Yes
  - Default: "pending"
  - Validation: Must be "pending", "reviewed", "resolved", "dismissed"

### Entry Title Pattern:
`Feedback for {{content_type}} - {{content_uid}}`

---

## 5. User Role Content Type (Optional - for advanced role management)

**UID:** `user_role`

### Fields:

- **role_name** (Single Line Textbox)
  - Required: Yes
  - Unique: Yes
  - Validation: Lowercase, alphanumeric and underscores only

- **display_name** (Single Line Textbox)
  - Required: Yes
  - Max length: 100 characters

- **permissions** (JSON)
  - Required: Yes
  - Default: `{}`
  - Description: JSON object defining permissions

- **description** (Textarea)
  - Required: No
  - Max length: 500 characters

### Entry Title Pattern:
`{{display_name}}`

---

## Content Type Relationships

```
Category
  ├── Documentation (many)
  └── FAQ (many)

Documentation
  ├── Category (one)
  └── Related Documentation (many)

FAQ
  └── Category (one)

Feedback
  └── References Documentation/FAQ (by UID)
```

---

## Setup Instructions

1. Log in to your Contentstack account
2. Navigate to Stack Settings → Content Types
3. Create each content type as described above
4. Set up the references between content types
5. Configure entry title patterns
6. Set up webhooks (see WEBHOOKS.md)
7. Create sample entries for testing

---

## Notes

- All content types should have `created_at` and `updated_at` timestamps (automatically managed by Contentstack)
- Use Contentstack's versioning feature for documentation versioning
- Configure custom roles in Contentstack to match the roles defined in `src/config/roles.js`
- Set up environments (development, staging, production) as needed

