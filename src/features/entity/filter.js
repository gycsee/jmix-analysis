const keywordFilter = (keyword) => (entity) => {
  return entity.entityName.indexOf(keyword) !== -1 
}

const fieldKeyFilter = keyword => entity => entity.properties.some(property => property.name.indexOf(keyword) !== -1)

export default function filter(entities, formData) {
  const {
    keyword,
    includeFieldKey
  } = formData

  if(!keyword) {
    return entities
  }

  const filters = [
    keyword && keywordFilter(keyword),
    includeFieldKey && fieldKeyFilter(keyword)
  ].filter(Boolean)

  return entities.filter(entity => {
    const bool = filters.some(filter => filter(entity))

    return bool
  })
}