define([], function() {
  /**
   * Given a list of template resource files URLs, fetch them and return
   * the bodies.
   *
   * @param {Array} fileNames The list of file names
   * @param {Array} path The list of relative or absolute paths to the files
   * @param {string} extension The type of extension to be used {html/json}
   * @return {Object} Map of file names to bodies.
   */
  async function loadResourceFiles(fileNames, path, extension) {
    const fileBodies = {};
    for (const fileName of fileNames) {
      if (fileName in fileBodies) continue;

      const fileData = await fetch(`${path}/${fileName}.${extension}`);
      const fileText = extension ===
            'json' ? await fileData.json() : await fileData.text();
      fileBodies[fileName] = fileText;
    }
    return fileBodies;
  }

  /**
   * Given a list of template names, load the relevant HTML templates.
   *
   * @param {Array} templateNames The list of template names
   * @return {Object} A map of template names to template content
   */
  async function loadTemplates(templateNames) {
    return loadResourceFiles(templateNames, 'templates', 'html');
  }

  /**
   * Given a list of text macro file names, load the relevant text macros.
   *
   * @param {Array} screenNames The screen names corresponding to the desired
   *  text macros.
   * @return {Object} A map of screen names to text macro objects.
   */
  async function loadScreenText(screenNames) {
    return loadResourceFiles(screenNames, 'screen_text', 'json');
  }

  /**
   * Given an HTML template and a map of text macros, populate the template and
   * return as a string.
   *
   * @param {string} template The unpopulated HTML template
   * @param {Object} screenText A map of macro keys to replacement text.
   * @return {string} The populated template
   */
  function populateScreenTemplate(template, screenText) {
    let outputTemplate = template;
    for (const textIdentifier in screenText) {
      if (Object.prototype.hasOwnProperty.call(screenText, textIdentifier)) {
        let replacementText = screenText[textIdentifier];
        if (Array.isArray(replacementText)) {
          replacementText = replacementText.join('');
        }

        const regex = new RegExp(`<%${textIdentifier}%>`, 'g');
        outputTemplate = outputTemplate.replace(
            regex,
            replacementText);
      }
    }
    return outputTemplate;
  }

  /**
   * Given a map of screen names to template types, fetch the require templates,
   * and populate with the correct text, then return as a map.
   *
   * @param {Object} screens Map of screen names to template types
   * @return {Object} Map of screen names to populated templates.
   */
  async function getSectionScreenTemplates(screens) {
    const templates = await loadTemplates(Object.values(screens));
    const screenText = await loadScreenText(Object.keys(screens));
    const populatedTemplates = {};
    for (const screen in screens) {
      if (Object.prototype.hasOwnProperty.call(screens, screen)) {
        populatedTemplates[screen] = populateScreenTemplate(
            templates[screens[screen]],
            screenText[screen]);
      }
    }
    return populatedTemplates;
  }

  return {populateScreenTemplate, getSectionScreenTemplates};
});
