import { SettingsOption } from '@/lib/api'

export const DEFAULT_PERSONS = [
  'Av.M.Şerif Bey', 'Ömer Bey', 'Av.İbrahim Bey', 'Av.Kenan Bey',
  'İsmail Bey', 'Ebru Hanım', 'Pınar Hanım', 'Yaren Hanım', 'İpek Hanım'
]

export const mergePersons = (customOptions: SettingsOption[]) =>
  [...new Set([...DEFAULT_PERSONS, ...customOptions.map(o => o.value)])]
