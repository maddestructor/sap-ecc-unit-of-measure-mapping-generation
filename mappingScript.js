exports.step = function (input) {
  const {
    baseUnitOfMeasureFromEcc,
    baseWeightUnitFromEcc,
    baseVolumeUnitFromEcc,
  } = input;

  const parser = require("csv-parse/sync");
  const eccUnitOfMeasureInput = fs.readFileSync(
    "./input/eccUnitOfMeasureInput.csv",
    { encoding: "utf8", flag: "r" }
  );
  const MappingsKeyedBySapUnit = {};
  const MappingsKeyedByIsoUnit = {};
  const MappingsKeyedBySapDisplayUnit = {};
  const MappingsKeyedByMxUnit = {};
  const MxWeightOptions = [];
  const MxVolumeOptions = [];
  const MxUnitOfMeasureOptions = [];
  const invalidUnits = [];

  const eccUnitOfMeasuresDbRows = parser.parse(eccUnitOfMeasureInput, {
    columns: true,
    skip_empty_lines: true,
  });
  // const eccUnitOfMeasuresDbRows = CSVToArray(eccUnitOfMeasureInput, ",", true);

  console.log(
    `Parsing ${eccUnitOfMeasuresDbRows.length} entries from ECC Unit of Measure table`
  );
  for (const {
    MSEHI: sapUnit, // SAP unit
    ISOCODE: isoUnit, // ISO unit
    MSEH3: sapDisplayUnit, // External Unit of Measurement in Commercial Format (3-Char.)
    MSEH6, //	External Unit of Measurement in Technical Format (6-Char.)
    MSEHT: mxUnit, // Unit of Measurement Text
  } of eccUnitOfMeasuresDbRows) {
    if (baseUnitOfMeasureFromEcc.includes(sapDisplayUnit)) {
      MappingsKeyedByIsoUnit[isoUnit] = {
        sapUnit,
        sapDisplayUnit,
        mxUnit,
      };
      MappingsKeyedBySapUnit[sapUnit] = {
        isoUnit,
        mxUnit,
        sapDisplayUnit,
      };
      MappingsKeyedBySapDisplayUnit[sapDisplayUnit] = {
        isoUnit,
        mxUnit,
        sapUnit,
      };
      MappingsKeyedByMxUnit[mxUnit] = {
        isoUnit,
        sapDisplayUnit,
        sapUnit,
      };
      MxUnitOfMeasureOptions.push(mxUnit);
    } else {
      invalidUnits.push({
        isoUnit,
        mxUnit,
        sapUnit,
        sapDisplayUnit,
      });
    }

    if (baseWeightUnitFromEcc.includes(sapDisplayUnit)) {
      MxWeightOptions.push(mxUnit);
    }

    if (baseVolumeUnitFromEcc.includes(sapDisplayUnit)) {
      MxVolumeOptions.push(mxUnit);
    }
  }

  writeResults(
    invalidUnits,
    MappingsKeyedBySapUnit,
    MappingsKeyedBySapDisplayUnit,
    MappingsKeyedByMxUnit,
    MappingsKeyedByIsoUnit,
    MxWeightOptions,
    MxVolumeOptions,
    MxUnitOfMeasureOptions
  );

  return "Finished running.";
};

function writeResults(
  invalidUnits,
  MappingsKeyedBySapUnit,
  MappingsKeyedBySapDisplayUnit,
  MappingsKeyedByMxUnit,
  MappingsKeyedByIsoUnit,
  MxWeightOptions,
  MxVolumeOptions,
  MxUnitOfMeasureOptions
) {
  writeFile("invalidUnits.json", invalidUnits);
  writeFile("MappingsKeyedBySapUnit.json", MappingsKeyedBySapUnit);
  writeFile(
    "MappingsKeyedBySapDisplayUnit.json",
    MappingsKeyedBySapDisplayUnit
  );
  writeFile("MappingsKeyedByMxUnit.json", MappingsKeyedByMxUnit);
  writeFile("MappingsKeyedByIsoUnit.json", MappingsKeyedByIsoUnit);

  const unsupportedString = "Unsupported unit of measure";
  MxUnitOfMeasureOptions.push(unsupportedString);
  writeFile("MxUnitOfMeasureOptions.json", MxUnitOfMeasureOptions);

  MxWeightOptions.push(unsupportedString);
  writeFile("MxWeightOptions.json", MxWeightOptions);

  MxVolumeOptions.push(unsupportedString);
  writeFile("MxVolumeOptions.json", MxVolumeOptions);

  const toAddToRestQuery = {
    MxUnitOfMeasureOptions,
    MxWeightOptions,
    MxVolumeOptions,
    MappingsKeyedByMxUnit,
    MappingsKeyedBySapUnit,
    MappingsKeyedBySapDisplayUnit,
    MappingsKeyedByIsoUnit,
  };

  writeFile("toAddToRestQuery.json", toAddToRestQuery);
}

function writeFile(fileName, data) {
  fs.writeFile("output/" + fileName, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
    console.log(`${fileName} has been written successfully`);
  });
}

const CSVToArray = (data, delimiter = ",", omitFirstRow = false) =>
  data
    .slice(omitFirstRow ? data.indexOf("\n") + 1 : 0)
    .split("\n")
    .map((v) => v.split(delimiter));
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
// function CSVToArray(strData, strDelimiter) {
//   // Check to see if the delimiter is defined. If not,
//   // then default to comma.
//   strDelimiter = strDelimiter || ",";

//   // Create a regular expression to parse the CSV values.
//   var objPattern = new RegExp(
//     // Delimiters.
//     "(\\" +
//       strDelimiter +
//       "|\\r?\\n|\\r|^)" +
//       // Quoted fields.
//       '(?:"([^"]*(?:""[^"]*)*)"|' +
//       // Standard fields.
//       '([^"\\' +
//       strDelimiter +
//       "\\r\\n]*))",
//     "gi"
//   );

//   // Create an array to hold our data. Give the array
//   // a default empty first row.
//   var arrData = [[]];

//   // Create an array to hold our individual pattern
//   // matching groups.
//   var arrMatches = null;

//   // Keep looping over the regular expression matches
//   // until we can no longer find a match.
//   while ((arrMatches = objPattern.exec(strData))) {
//     // Get the delimiter that was found.
//     var strMatchedDelimiter = arrMatches[1];

//     // Check to see if the given delimiter has a length
//     // (is not the start of string) and if it matches
//     // field delimiter. If id does not, then we know
//     // that this delimiter is a row delimiter.
//     if (strMatchedDelimiter.length && strMatchedDelimiter != strDelimiter) {
//       // Since we have reached a new row of data,
//       // add an empty row to our data array.
//       arrData.push([]);
//     }

//     // Now that we have our delimiter out of the way,
//     // let's check to see which kind of value we
//     // captured (quoted or unquoted).
//     if (arrMatches[2]) {
//       // We found a quoted value. When we capture
//       // this value, unescape any double quotes.
//       var strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
//     } else {
//       // We found a non-quoted value.
//       var strMatchedValue = arrMatches[3];
//     }

//     // Now that we have our value string, let's add
//     // it to the data array.
//     arrData[arrData.length - 1].push(strMatchedValue);
//   }

//   // Return the parsed data.
//   return arrData;
// }
