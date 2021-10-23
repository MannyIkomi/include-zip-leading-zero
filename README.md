# include-zip-leading-zero

A script useful for adding leading zero's to a ```.csv``` mailing list with US zipcodes.
1. Place ```.csv``` files in an `/input` folder
2. Create an `/output` folder
3. Specify list of ```POSSIBLE_ZIP_COLUMNS``` (defaults to ```"Zip"```)
```
const 
  ZIP_KEY = 'Zip',
  OWNER_ZIP_KEY = 'Owner_Zip',
  ZIPCODE_KEY = 'Zipcode'

// case-sensitive matching
const POSSIBLE_ZIP_COLUMNS = [ZIP_KEY, ZIPCODE_KEY, OWNER_ZIP_KEY]
```
3. `npm start`
2. Magic 🎉
