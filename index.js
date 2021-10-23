import {parseStream, writeToPath} from 'fast-csv';
import {readdir} from 'fs/promises'
import fs from 'fs'

const FOLDER_READ_PATH = 'input'
const FOLDER_WRITE_PATH = 'output'

const addLeadingZero = (string) => `0${string}`
const zipCodeRegex = /^\d{5}(?:[- ]?\d{4})?$/

const 
  ZIP_KEY = 'Zip',
  OWNER_ZIP_KEY = 'Owner_Zip',
  ZIPCODE_KEY = 'Zipcode'

// case-sensitive matching
const POSSIBLE_ZIP_COLUMNS = [ZIP_KEY, ZIPCODE_KEY, OWNER_ZIP_KEY]

function findZipColumn(row, searchTerms = [ZIP_KEY]){
  const rowHeadings = Object.keys(row)
  
  const searchQuery = searchTerms.flatMap((searchTerm) => {
    const results = rowHeadings.find((column) => column === searchTerm) ? searchTerm : false
    return results
  }).filter(result => result) //.filter only returns truthy values

  const searchResult = searchQuery.length === 1 ? searchQuery[0] : false
  return searchResult
}

async function getFileList(path = FOLDER_READ_PATH){
  let csvFiles = await readdir(path)
  return csvFiles
}

getFileList(FOLDER_READ_PATH).then(files => {

  for(let fileName of files){
  
    let newFileRows = []
    let usingColumn = ''
    
    // iterate over files, side effects
    parseStream(fs.createReadStream(`${FOLDER_READ_PATH}/${fileName}`), { headers: true, objectMode: true, ignoreEmpty: true, trim: true, discardUnmappedColumns: true })
    .on('error', error => console.error(fileName, error))
    .on('data', row => {
     
      const foundColumn = usingColumn || findZipColumn(row, POSSIBLE_ZIP_COLUMNS)
      usingColumn = foundColumn

      const isZipCode = zipCodeRegex.test(row[usingColumn])
      const isMissingLeadingZero = row[usingColumn] ? row[usingColumn].length === 4 : false

      if(!isZipCode && usingColumn && isMissingLeadingZero){
        const zipWithZero = addLeadingZero(row[usingColumn])
        row[usingColumn] = zipWithZero
        newFileRows.push(row)
        return
      }
      
      if(isZipCode){
        // No need to mutate the {row}, just push original {row} into {newFile}
        newFileRows.push(row)
        return
      }
      else {
        // throw new Error(`🛑 ${fileName} needs to match if() condition`)
        throw new Error(`🛑 ${fileName} does not contain one of the specified columns: [${POSSIBLE_ZIP_COLUMNS}]`)
      }
    })
    .on('end', parsedRowCount => {
      if(usingColumn){
        writeToPath(`${FOLDER_WRITE_PATH}/${fileName}`, newFileRows, {objectMode:true, headers: true, alwaysWriteHeaders: true}).on('error', err => console.error(err))
  
        console.log(`✅ ${fileName}\n   Column ${usingColumn} written to ${FOLDER_WRITE_PATH} \n   All rows included? ${newFileRows.length === parsedRowCount}`)
        return
      }
      throw new Error('Missed a condition')
    });
  }
}).catch(err => console.error(err));