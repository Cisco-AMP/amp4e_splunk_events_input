export const createSelectOptions = (options, isIndex) =>
  options.map(({ id, guid, name }) => ({
    value: isIndex ? name : id || guid,
    label: isIndex ? name : `${name} (${id || guid})`
  }))

export const getIds = (selected) => selected.map(({ value }) => value).join(",")

export const getNames = (selected) =>
  selected.map(({ label }) => label).join("---")
