# Manual for data-files
This file contains blablablah, but also some information about the several data-files. Since we're in development all data structures have implementations for testing purposes. When releasing, those files should be deleted and only `*.template.json` files should be used.

## Structure (root is the "data"-folder of the project)
**Bold** items are folders, *italic* items still need to be implemented.
- **completed_rubrics**
  - \*.json
- general_settings.template.json should become *settings.template.json*
-

### settings.json
This file contains all the basic settings for a tournament. It contains the lanes and their corresponding rooms, and more.

### judgingpanels.json
This contains the names and rooms of the juding panels.

### teams.json
Contains the teams of a tournament. This file has the same structure as in the other FLL-applications.

### questions.json
Contains a json-translation of the FIRST-juding rubrics forms and the information to implement those rubrics in the application.
##### To do
- Change names to "[RD/CV/PR]\_[LANG].json".
- When language support is needed, probably change to folder-based structure.


### awards.json
Contains all the (judging) awards of a tournament. This file can be used to transport to other applications such as the [Display system](https://github.com/FirstLegoLeague/displaySystem) for filling in the overlays. Contains the FIRST-defined awards.
##### To do
- Implement possibility to add/change awards. For this, a standard file and an edited file for the tournament should be available. The standard-file contains the official FIRST-awards as described on their (website)[http://firstlegoleague.org/awards]
