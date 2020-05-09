const path = require('path')
const fs = require('fs')

/**
 * Delete file by given path
 * @param {string} filePath
 */
async function deleteFile(filePath) {
  return new Promise(function(resolve, reject) {
    fs.unlink(filePath, error => {
      if (error) {
        console.log(
          `Error to delete file by path: ${filePath}. ${error.message}`
        )
        return reject(error)
      }
      return resolve()
    })
  })
}

/**
 * Store a file into storage
 * @param {string} fileName
 * @param {string} tmpFilePath
 * @return {string} encrypted storage path
 */
async function storeFile(fileName, tmpFilePath) {
  return new Promise(function(resolve, reject) {
    const absoluteFilePath = path.join(process.cwd(), 'storages', fileName)

    // Move uploaded file from temp to storage
    fs.rename(tmpFilePath, absoluteFilePath, async err => {
      if (err) {
        if (err.code === 'EXDEV') {
          // Reason is OS or System not allow move file, so we will copy and then remove tmp file
          try {
            return resolve(await copyFile(tmpFilePath, absoluteFilePath))
          } catch (e) {
            return reject(e)
          }
        }
        return reject(err)
      }

      return resolve()
    })
  })
}

/**
 * Copy file from tmp path to new path, using nodejs stream
 * @param tmpFilePath
 * @param filePath
 * @returns {Promise<any>}
 */
function copyFile(tmpFilePath, filePath) {
  return new Promise(function(resolve, reject) {
    // Create read & write stream
    let readStream = fs.createReadStream(tmpFilePath),
      writeStream = fs.createWriteStream(filePath)

    readStream.on('error', function(err) {
      reject(err)
    })
    writeStream.on('error', function(err) {
      reject(err)
    })

    // When closed event was emit, we'll delete tmp file
    readStream.on('close', function() {
      fs.unlink(tmpFilePath, filePath)
      resolve()
    })

    readStream.pipe(writeStream)
  })
}

module.exports = {
  deleteFile,
  storeFile,
  copyFile,
}
