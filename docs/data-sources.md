# Data sources

| Data | Source | Used for |
|---|---|---|
| Typical monthly climate | [NASA POWER](https://power.larc.nasa.gov/), monthly climatology | Temperature, frost, rain, humidity and sunlight of each month. |
| Elevation | [NASADEM](https://planetarycomputer.microsoft.com/dataset/nasadem) (NASA), through Microsoft Planetary Computer | Lot elevation, and the temperature adjustment to that elevation. |
| Satellite imagery | Esri World Imagery and World Imagery Wayback | Map background, older photos ("Otra foto") and lot pictures. |
| Place search | ArcGIS geocoding | Finding the farm by name. |
| Crops, pests and diseases | ProdTerra team catalog | Crop ranges, cycles, families and pests. |

The web app does not call NASA directly: the [API](https://github.com/ProdTerra/prodterra-api) reads and combines the data.

## Notes

- The climate is the average of past years, not a forecast. The app says so wherever it shows climate.
- NASA POWER cells are about 50 km wide. The API adjusts the temperature to the real elevation of each lot.
- The map uses the most detailed imagery available at each place. Where there is no more detail, the photo is enlarged and the map says so.
