// Interface
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('Duplicate Extending')
      .addItem('Settings', 'openExtending')
      .addToUi();
}

function openExtending() {
  let html = HtmlService.createHtmlOutputFromFile('index');
  SpreadsheetApp.getUi()
      .showModalDialog(html, 'Duplicate Extending');
}

// Functional
function doFunctional(dataInput, blanksStatus = false, matchCaseStatus = false) {
  let ss              = SpreadsheetApp.getActiveSpreadsheet(),
      sheet           = ss.getSheets()[0],
      selectRange     = sheet.getRange(dataInput),
      columns         = checkMatchCaseStatus(rowsToColumns(selectRange.getValues())),
      cellsDuplicates = searchCells(selectRange, columns, searchDuplicates(columns)),
      lastColumn      = selectRange.getLastColumn();

  function checkMatchCaseStatus(columns) {
    if(matchCaseStatus) {
      let total = [];

      for(let array of columns) {
        let buffer = [];

        for(let element of array) {
          if(element === null) {
            buffer.push(null)
            continue
          }

          buffer.push(element.toString().toLowerCase());
        }

        total.push(buffer);
      }

      return total;
    }

    return columns;
  }

  function rowsToColumns(rows) {
    let total = [],
        count = 0;

    rows.forEach((deepRow) => {
      if(count < deepRow.length) count = deepRow.length;
    });

    while(count > 0){
      total.push([]);
      count -= 1;
    }

    for(let element of rows) {
      for(let i = 0; i < element.length; i++) {
        if(element[i] === '') {
          total[i].push(null);
          continue;
        }

        total[i].push(element[i]);
      }
    }

    return total;
  }

  function searchDuplicates(columns) {
    let total = [];

    for(let element of columns) {
      let buffer = [];

      for(let x = 0; x < element.length; x++) {
        for(let y = x + 1; y < element.length; y++) {
          if(element[x] === element[y] && buffer.indexOf(element[x]) === -1) {
            buffer.push(element[x]);
          }
        }
      }

      total.push(buffer);
    }

    return total;
  }

  function searchCells(selectRange, sourceDuplicates, duplicates) {
    let total = [],
        top   = selectRange.getRow() - 1,
        left  = selectRange.getColumn() - 1;

    for(let i = 0; i < duplicates.length; i++) {
      for(let j = 0; j < sourceDuplicates[i].length; j++) {
        for(let duplicate of duplicates[i]) {
          if(sourceDuplicates[i][j] === duplicate) {
            total.push(sheet.getRange(sourceDuplicates[i].indexOf(duplicate, j) + 1 + top, i + 1 + left));
          }
        }
      }
    }

    return total;
  }

  function columnToLetter(column){
    let temp, letter = '';

    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }

    return letter;
  }

  function setDuplicatesInfo(cells, lastColumn) {
    for(let cell of cells) {
      let range = sheet.getRange(cell.getRow(), lastColumn + 1);

      if(cell.getValue() === '' && blanksStatus) continue;

      cell.setBackground("#ffff00");
      range.setValue('Duplicate cl.' + columnToLetter(cell.getColumn()));
    }
  }


  setDuplicatesInfo(cellsDuplicates, lastColumn)

  //Debug
  // Logger.log('Blanks status:', blanksStatus);
  // Logger.log('Match Case Status:', matchCaseStatus);
  // Logger.log('Columns:', columns);
  // Logger.log('Duplicates:', searchDuplicates(columns));
  // Logger.log('Cell:', cellsDuplicates.length);
  // Logger.log('Last Column:', lastColumn)
}


//Бесконечное каррирование
function infiniteCurry(a) {
  let next = (...args) => {
    return (x) => {
      if (!x) {
        return args.reduce((acc, a) => {
          return acc + a;
        }, a);
      }
      return next(...args, x);
    };
  };
  return next();
}

console.log(infiniteCurry(1)(2)(3)());
