exports.step = function (input) {
  const {
    baseUnitOfMeasureFromEcc,
    baseWeightUnitFromEcc,
    baseVolumeUnitFromEcc,
  } = input;

  const MappingsKeyedBySapUnit = {};
  const MappingsKeyedByIsoUnit = {};
  const MappingsKeyedBySapDisplayUnit = {};
  const MappingsKeyedByMxUnit = {};
  const MxWeightOptions = [];
  const MxVolumeOptions = [];
  const MxUnitOfMeasureOptions = [];
  const invalidUnits = [];

  const eccUnitOfMeasureInput = fs.readFileSync(
    "./input/eccUnitOfMeasureInput.csv",
    { encoding: "utf8", flag: "r" }
  );
  const parser = require("csv-parse/sync");
  const eccUnitOfMeasuresDbRows = parser.parse(eccUnitOfMeasureInput, {
    columns: true,
    skip_empty_lines: true,
  });

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

  writeFile("RestQueryMappings.json", toAddToRestQuery);
}

function writeFile(fileName, data) {
  fs.writeFile("output/" + fileName, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
    console.log(`${fileName} has been written successfully`);
  });
}
