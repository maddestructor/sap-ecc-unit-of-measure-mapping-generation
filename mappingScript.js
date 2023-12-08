exports.step = function (input, fileInput) {
  const { mappingsKeyedByIsoUnit } = input;

  const MappingsKeyedBySapUnit = {};
  const MappingsKeyedBySapDisplayUnit = {};
  const MappingsKeyedByMxUnit = {};

  console.log(
    "Amount of entries to parse: " +
      Object.entries(mappingsKeyedByIsoUnit).length
  );
  for (const [isoUnit, { mxUnit, sapUnit, sapDisplayUnit }] of Object.entries(
    mappingsKeyedByIsoUnit
  )) {
    MappingsKeyedBySapUnit[sapUnit] = { isoUnit, mxUnit, sapDisplayUnit };
    MappingsKeyedBySapDisplayUnit[sapDisplayUnit] = {
      isoUnit,
      mxUnit,
      sapUnit,
    };
    MappingsKeyedByMxUnit[mxUnit] = { isoUnit, sapDisplayUnit, sapUnit };
  }

  writeFile("MappingsKeyedBySapUnit.json", MappingsKeyedBySapUnit);
  writeFile(
    "MappingsKeyedBySapDisplayUnit.json",
    MappingsKeyedBySapDisplayUnit
  );
  writeFile("MappingsKeyedByMxUnit.json", MappingsKeyedByMxUnit);
  writeFile("MappingsKeyedByIsoUnit.json", mappingsKeyedByIsoUnit);

  const unsupportedString = "Unsupported unit of measure";
  const MxUnitOfMeasureOptions = Object.keys(MappingsKeyedByMxUnit).concat([
    unsupportedString,
  ]);
  writeFile("MxUnitOfMeasureOptions.json", MxUnitOfMeasureOptions);

  const MxWeightOptions = [
    mappingsKeyedByIsoUnit["GRM"].mxUnit,
    mappingsKeyedByIsoUnit["KGM"].mxUnit,
    mappingsKeyedByIsoUnit["LBR"].mxUnit,
    mappingsKeyedByIsoUnit["MGM"].mxUnit,
    mappingsKeyedByIsoUnit["ONZ"].mxUnit,
    mappingsKeyedByIsoUnit["TNE"].mxUnit,
    mappingsKeyedByIsoUnit["STN"].mxUnit,
    mappingsKeyedByIsoUnit["MC"].mxUnit,
    unsupportedString,
  ];

  writeFile("MxWeightOptions.json", MxWeightOptions);

  const MxVolumeOptions = [
    mappingsKeyedByIsoUnit["INQ"].mxUnit,
    mappingsKeyedByIsoUnit["_22"].mxUnit,
    mappingsKeyedByIsoUnit["5A"].mxUnit,
    mappingsKeyedByIsoUnit["CMQ"].mxUnit,
    mappingsKeyedByIsoUnit["DMQ"].mxUnit,
    mappingsKeyedByIsoUnit["CLT"].mxUnit,
    mappingsKeyedByIsoUnit["OZA"].mxUnit,
    mappingsKeyedByIsoUnit["FTQ"].mxUnit,
    mappingsKeyedByIsoUnit["GLL"].mxUnit,
    mappingsKeyedByIsoUnit["HLT"].mxUnit,
    mappingsKeyedByIsoUnit["LTR"].mxUnit,
    mappingsKeyedByIsoUnit["MTQ"].mxUnit,
    mappingsKeyedByIsoUnit["MLT"].mxUnit,
    mappingsKeyedByIsoUnit["MMQ"].mxUnit,
    mappingsKeyedByIsoUnit["PT"].mxUnit,
    mappingsKeyedByIsoUnit["QT"].mxUnit,
    mappingsKeyedByIsoUnit["_12"].mxUnit,
    mappingsKeyedByIsoUnit["YDQ"].mxUnit,
    mappingsKeyedByIsoUnit["4G"].mxUnit,
    unsupportedString,
  ];

  writeFile("MxVolumeOptions.json", MxVolumeOptions);

  const toAddToRestQuery = {
    MxUnitOfMeasureOptions,
    MxWeightOptions,
    MxVolumeOptions,
    MappingsKeyedByMxUnit,
    MappingsKeyedBySapUnit,
    MappingsKeyedBySapDisplayUnit,
    MappingsKeyedByIsoUnit: mappingsKeyedByIsoUnit,
  };

  writeFile("toAddToRestQuery.json", toAddToRestQuery);

  return "Finished running.";
};

function writeFile(fileName, data) {
  fs.writeFile("output/" + fileName, JSON.stringify(data), (err) => {
    if (err) {
      console.error(err);
    }
    console.log(`${fileName} has been written successfully`);
  });
}
