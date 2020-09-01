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
        const fileNamingPromises = [];
        const fileNamingMapping = {};
        fileNames.forEach((fileName) => {
          if (!fileName.startsWith('.')) {
            const oldFilePath = path.resolve(dirAbsPath, fileName);

            fileNamingPromises.push(
              fs
                .stat(oldFilePath)
                .then((stat) => {
                  const fileExtension = path.extname(fileName);
                  const oldFilePathWithoutExtension = path.basename(fileName, fileExtension);
                  const newFileNameWithoutExtension = getNewFilePathWithoutExtension(stat.birthtimeMs);

                  const expectedNewFileName = `${newFileNameWithoutExtension} ${oldFilePathWithoutExtension}${fileExtension}`;
                  fileNamingMapping[oldFilePath] = expectedNewFileName;
                })
            );
          }
        });

        return Promise
          .all(fileNamingPromises)
          .then(() => {
            return fileNamingMapping;
          });
      })
      .then((fileNamingMapping) => {
        const fileRenamingPromises = [];
        Object.entries(fileNamingMapping).forEach(([oldFilePath, newFileName]) => {
          const oldFileName = path.basename(oldFilePath);
          const newFilePath = path.resolve(path.dirname(oldFilePath), newFileName);
          fileRenamingPromises.push(
            fs
              .rename(oldFilePath, newFilePath)
              .then(() => {
                console.log(`"${oldFileName}" renamed as "${newFileName}"`);
              })
          );
        });

        return Promise.all(fileRenamingPromises);
      })
      .then(() => {
        console.log('All files have been renamed successfully');
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

function getNewFilePathWithoutExtension(birthtimeMs) {
  const birthtimeDate = new Date(birthtimeMs);

  const dateString = formatDateString(birthtimeDate.getDate());
  const monthString = formatDateString(birthtimeDate.getMonth() + 1);
  const yearString = birthtimeDate.getFullYear();
  const hoursString = formatDateString(birthtimeDate.getHours());
  const minutesString = formatDateString(birthtimeDate.getMinutes());
  const secondsString = formatDateString(birthtimeDate.getSeconds());

  return `${yearString}.${monthString}.${dateString} ${hoursString}${minutesString}${secondsString}`;
}
