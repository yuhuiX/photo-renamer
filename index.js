const fs = require('fs').promises;
const path = require('path');

(async () => {
  const args = process.argv;
  let dirAbsPath;
  args.forEach((val, index) => {
    if (val === '--dirAbsPath' && args[index + 1]) {
      dirAbsPath = args[index + 1];
    }
  });

  if (dirAbsPath) {
    fs
      .readdir(dirAbsPath)
      .then((fileNames) => {
        let renameFileProcessPromises = Promise.resolve();
        fileNames.forEach((fileName, index) => {
          if (!fileName.startsWith('.')) {
            renameFileProcessPromises = renameFileProcessPromises.then(() => {
              const oldFilePath = path.resolve(dirAbsPath, fileName);

              return new Promise((resolve, reject) => {
                fs
                  .stat(oldFilePath)
                  .then((stat) => {
                    const newFilePathWithoutExtension = getNewFilePathWithoutExtension({
                      dirAbsPath: dirAbsPath,
                      birthtimeMs: stat.birthtimeMs,
                    });
                    const fileExtension = path.extname(fileName);

                    const expectedNewFilePath = `${newFilePathWithoutExtension}${fileExtension}`;
                    fs
                      .stat(expectedNewFilePath)
                      .then(() => {
                        renameFile({
                          newFilePath: `${newFilePathWithoutExtension}_${index}${fileExtension}`,
                          oldFilePath,
                          reject,
                          resolve,
                        });
                      })
                      .catch(() => {
                        renameFile({
                          newFilePath: expectedNewFilePath,
                          oldFilePath,
                          reject,
                          resolve,
                        });
                      });
                    });
              });
            });
          }
        });

        return renameFileProcessPromises;
      })
      .catch((err) => {
        console.log(err);
      });
  }
})().catch(err => {
  console.error(err);
});

function formatDateString(number) {
  return ('0' + number).slice(-2);
}

function getNewFilePathWithoutExtension(options) {
  const dirAbsPath = options.dirAbsPath;
  const birthtimeMs = options.birthtimeMs;

  const birthtimeDate = new Date(birthtimeMs);

  const dateString = formatDateString(birthtimeDate.getDate());
  const monthString = formatDateString(birthtimeDate.getMonth() + 1);
  const yearString = birthtimeDate.getFullYear();
  const hoursString = formatDateString(birthtimeDate.getHours());
  const minutesString = formatDateString(birthtimeDate.getMinutes());
  const secondsString = formatDateString(birthtimeDate.getSeconds());

  const newFileName = `${yearString}.${monthString}.${dateString} ${hoursString}${minutesString}${secondsString}`;
  return path.resolve(dirAbsPath, newFileName);
}

function renameFile(options) {
  const newFilePath = options.newFilePath;
  const oldFilePath = options.oldFilePath;
  const reject = options.reject;
  const resolve = options.resolve;

  const oldFileName = path.basename(oldFilePath);
  const newFileName = path.basename(newFilePath);

  fs
    .rename(oldFilePath, newFilePath)
    .then(() => {
      console.log(`${oldFileName} renamed as ${newFileName}`);
      resolve();
    })
    .catch((err) => {
      reject(err);
    });
}
