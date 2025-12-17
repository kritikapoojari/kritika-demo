# Contentstack Query Implementation Guide

## Correct Query Syntax

Based on Contentstack JavaScript SDK v3.x documentation, here's the correct way to query entries:

### Basic Query Structure

```javascript
const Stack = Contentstack.Stack({
  api_key: 'your_api_key',
  delivery_token: 'your_delivery_token',
  environment: 'production'
});

// Create query instance
const Query = Stack.ContentType('content_type_uid').Query();

// Add query methods (chainable)
Query.includeReference(['reference_field'])
     .includeCount()
     .where('field_name', 'value')
     .limit(10)
     .skip(0);

// Execute query
const result = await Query.find();
```

### Response Format

Contentstack JavaScript SDK v3.x returns:
```javascript
{
  items: [],      // Array of entries
  count: number  // Total count (if includeCount() was called)
}
```

### Common Query Methods

1. **Filter by field:**
   ```javascript
   Query.where('field_name', 'value')
   ```

2. **Filter by reference:**
   ```javascript
   Query.where('reference_field', 'reference_uid')
   ```

3. **Include references:**
   ```javascript
   Query.includeReference(['field1', 'field2'])
   ```

4. **Include count:**
   ```javascript
   Query.includeCount()
   ```

5. **Limit results:**
   ```javascript
   Query.limit(10)
   ```

6. **Skip results:**
   ```javascript
   Query.skip(5)
   ```

7. **Sort ascending:**
   ```javascript
   Query.ascending('created_at')
   ```

8. **Sort descending:**
   ```javascript
   Query.descending('created_at')
   ```

9. **Search/Regex:**
   ```javascript
   Query.where('title', Stack.Query().regex('search_term', 'i'))
   ```

### Example: Fetch All Documentation

```javascript
const Query = Stack.ContentType('documentation').Query();
Query.includeReference(['category', 'related_docs'])
     .includeCount();

const result = await Query.find();
console.log('Entries:', result.items);
console.log('Count:', result.count);
```

### Example: Fetch by UID

```javascript
const Query = Stack.ContentType('documentation').Query();
Query.where('uid', 'entry_uid')
     .includeReference(['category']);

const result = await Query.find();
const entry = result.items[0];
```

### Example: Filter by Reference

```javascript
const Query = Stack.ContentType('documentation').Query();
Query.where('category', 'category_uid')
     .includeReference(['category']);

const result = await Query.find();
```

### Example: Search

```javascript
const Query = Stack.ContentType('documentation').Query();
const searchRegex = new RegExp('search term', 'i');
Query.or(Stack.Query().where('title', searchRegex))
     .or(Stack.Query().where('description', searchRegex));

const result = await Query.find();
```

## Important Notes

1. **Query methods are chainable** - You can chain multiple methods together
2. **Execute with `.find()`** - Always end with `.find()` to execute the query
3. **Response structure** - Always check `result.items` for entries array
4. **Error handling** - Wrap queries in try-catch blocks
5. **References** - Use `includeReference()` to fetch referenced content

## Troubleshooting

### Issue: Empty results
- Check if entries are published in the correct environment
- Verify content type UID is correct
- Check field names match exactly (case-sensitive)

### Issue: Reference fields empty
- Use `includeReference(['field_name'])` to fetch references
- Verify reference field UID is correct

### Issue: Query not working
- Check API credentials are correct
- Verify environment name matches
- Check browser console for detailed errors

## Resources

- [Contentstack JavaScript SDK Documentation](https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/javascript-browser)
- [Querying Entries Guide](https://www.contentstack.com/docs/developers/web-framework/querying)
- [Content Delivery API Reference](https://www.contentstack.com/docs/developers/apis/content-delivery-api/)

