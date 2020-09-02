# photo-renamer

Rename photos imported from camera automatically.

Currently, the photos are just prepenpend with date and time information.

If `IMG_1234.jpg` was shot at 2008.08.24 13:24:50 (Europe/Berlin)
- it will be renamed as `2008.08.24 132450 IMG_1234.jpg`
- if additionally, `--place antarktika` is indicated, then it will be renamed as `2008.08.24 132450 antarktika IMG_1234.jpg`

| Parameter | Description |
| -- | -- |
| --dirAbsPath | absolute path to the directory |
| --place | where the iamge is shot, could be the country, city, or event name |
