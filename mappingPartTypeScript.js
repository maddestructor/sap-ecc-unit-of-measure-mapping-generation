exports.step = function (input) {
  const parser = require("csv-parse/sync");
  const partTypesCsv = fs.readFileSync("./input/sapToMxPartTypes.csv", {
    encoding: "utf8",
    flag: "r",
  });
  const types = parser.parse(partTypesCsv, {
    columns: true,
    skip_empty_lines: true,
  });

  const PartTypesKeyedBySapCode = {};
  const PartTypesKeyedByMXCode = {};

  for (const {
    ProductType,
    SupportsPlantStock,
    SupportsPurchasing,
    SupportsValuation,
    DefaultValuationClass,
    MXPartType,
  } of types) {
    PartTypesKeyedBySapCode[ProductType] = {
      SupportsPlantStock: "true" === SupportsPlantStock,
      SupportsPurchasing: "true" === SupportsPurchasing,
      SupportsValuation: "true" === SupportsValuation,
      DefaultValuationClass,
      MXPartType,
    };
    PartTypesKeyedByMXCode[MXPartType] = {
      ProductType,
      SupportsPlantStock: "true" === SupportsPlantStock,
      SupportsPurchasing: "true" === SupportsPurchasing,
      SupportsValuation: "true" === SupportsValuation,
      DefaultValuationClass,
    };
  }

  const MxPartTypes = Object.keys(PartTypesKeyedByMXCode);

  writeFile("PartTypesKeyedBySapCode.json", PartTypesKeyedBySapCode);
  writeFile("PartTypesKeyedByMXCode.json", PartTypesKeyedByMXCode);
  writeFile("MxPartTypes.json", MxPartTypes);

  const restQueryPartTypes = {
    PartTypesKeyedBySapCode,
    PartTypesKeyedByMXCode,
    MxPartTypes,
  };

  writeFile("RestQueryPartTypes.json", restQueryPartTypes);

  return {
    PartTypesKeyedBySapCode,
    PartTypesKeyedByMXCode,
  };
};

function writeFile(fileName, data) {
  fs.writeFile("output/" + fileName, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
    console.log(`${fileName} has been written successfully`);
  });
}
