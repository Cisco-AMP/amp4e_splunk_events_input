export const createSelectOptions = (options) =>
  options.map(({ id, guid, name }) => ({
    value: id || guid,
    label: `${name} (${id || guid})`
  }))

export const getIds = (selected) => selected.map(({ value }) => value).join(",")

export const getNames = (selected) =>
  selected.map(({ label }) => label).join("---")
