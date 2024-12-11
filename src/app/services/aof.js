import qs from 'qs';
const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parser');

const axios = require('axios');
const processViewCountRecord = async () => {
  const XLSX = require('xlsx');
  const workbook = XLSX.readFile('dropbox/view.xlsx');
  const sheetNameList = workbook.SheetNames;
  // const accessLogList = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);
  const worksheet = workbook.Sheets[sheetNameList[0]];
  const accessLogList = [];

  for (const z in worksheet) {
    if (z.toString()[0] === 'A') {
      accessLogList.push(worksheet[z].v);
    }
  }

  console.log(accessLogList);

  // fs.writeFileSync('out≈put/view.json', JSON.stringify(diseaseList), 'utf8');

  const viewCountMap = new Map();
  for await (const line of accessLogList) {
    if (!line || line.length <= 1) {
      continue;
    }
    // Each line in input.txt will be successively available here as `line`.
    // console.log('Line from file:', line);
    const [url, viewCount] = line.split(',');
    const formattedUrl = Buffer.from(url).toString().replaceAll('"', '');
    if (formattedUrl.includes('sfvrsn')) {
      const procesUrl = `${formattedUrl.substring(0, formattedUrl.indexOf('?'))}?sfvrsn`;
      if (viewCountMap.has(procesUrl)) {
        viewCountMap.set(procesUrl, parseInt(viewCountMap.get(procesUrl)) + parseInt(viewCount));
      } else {
        viewCountMap.set(procesUrl, parseInt(viewCount));
      }
    } else {
      viewCountMap.set(formattedUrl, parseInt(viewCount));
    }
  }
  // console.log([...viewCountMap.entries()]);

  const lookupWorkbook = XLSX.readFile('dropbox/LookupList.xlsx');
  const lookupSheetNameList = lookupWorkbook.SheetNames;
  const lookupList = XLSX.utils.sheet_to_json(lookupWorkbook.Sheets[lookupSheetNameList[0]]);

  const outputList = [];
  for (const lookup of lookupList) {
    let viewCount = 0;
    for (const [key, value] of viewCountMap) {
      // console.log('lookup.Title', lookup.Title);
      // console.log('keye', key);
      if (key.includes(lookup.Title)) {
        if (lookup.Title.includes('sfvrsn')) {
          console.log(`loccated sfvrsn ${lookup.Title} ${key} in lookup list`, value);
          viewCount = value;
          break;
        } else {
          console.log(`loccated ${lookup.Title} ${key} in lookup list`, value);
          viewCount = value;
          break;
        }
      }
    }
    outputList.push({
      Title: lookup.Title,
      ViewCount: viewCount || 0
    });
  }

  const outWorkBook = XLSX.utils.book_new();
  const outWorkSheet = XLSX.utils.json_to_sheet(outputList);
  XLSX.utils.book_append_sheet(outWorkBook, outWorkSheet, 'AoF');
  XLSX.writeFile(outWorkBook, 'output/AoF_ViewCount.xlsx');

  // console.log('lookupList', lookupList);
};

export const processAoF = async () => {
  try {
    await processViewCountRecord();
  } catch (error) {
    console.error(error);
  }
};
