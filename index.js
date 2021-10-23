import {parseStream, writeToPath} from 'fast-csv';
import {readdir} from 'fs/promises'
import fs from 'fs'

const FOLDER_READ_PATH = 'input'
const FOLDER_WRITE_PATH = 'output'

const addLeadingZero = (string) => `0${string}`
const zipCodeRegex = /^\d{5}(?:[- ]?\d{4})?$/

const 
  ZIP_KEY = 'Zip',
  OWNER_ZIP_KEY = 'Owner_Zip'

async function getFileList(path = FOLDER_READ_PATH){
  let csvFiles = await readdir(path)
  return csvFiles
}

getFileList(FOLDER_READ_PATH).then(files => {
  for(let fileName of files){
  
    let fileRows = []
    // iterate over files, side effects
    parseStream(fs.createReadStream(`${FOLDER_READ_PATH}/${fileName}`), { headers: true, objectMode: true, ignoreEmpty: true, trim: true, discardUnmappedColumns: true })
    .on('error', error => console.error(fileName, error))
    .on('data', row => {
      const isZipCode = zipCodeRegex.test(row[ZIP_KEY]) || zipCodeRegex.test(row[OWNER_ZIP_KEY])
      
      if(!isZipCode && row[ZIP_KEY]?.length === 4){
        const zipWithZero = addLeadingZero(row.Zip)
        row[ZIP_KEY] = zipWithZero
        // fileRows.push(row)
        // console.log(row, zipCodeRegex.test(row[ZIP_KEY]))
      }
      if(!isZipCode && row[OWNER_ZIP_KEY]?.length === 4){
        const zipWithZero = addLeadingZero(row[OWNER_ZIP_KEY])
        row[OWNER_ZIP_KEY] = zipWithZero
        // fileRows.push(row)
      }
      
      if(isZipCode){
        // console.log(`Row ${index} has a valid zipcode in ${fileName}`);
      }
      fileRows.push(row)
    })
    .on('end', rowCount => {
      writeToPath(`${FOLDER_WRITE_PATH}/${fileName}`, fileRows, {objectMode:true, headers: true, alwaysWriteHeaders: true}).on('error', err => console.error(err))

      console.log(fileName, 'written to ', FOLDER_WRITE_PATH, ' All rows included: ', fileRows.length === rowCount)
    });


  }
    
}).catch(err => console.error(err));