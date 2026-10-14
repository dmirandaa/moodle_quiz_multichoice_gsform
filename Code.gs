var FORM_ID_PROPERTY = "";
var OUTPUT_FILE_ID_PROPERTY = "";
var DEFAULT_QUESTION_GRADE = 1;
var DEFAULT_QUESTION_PENALTY = 0.3333333;

var FIELD_TITLES = {
  name: "Nome da questão",
  question: "Texto da questão (HTML)",
  answers: "Alternativas (uma por linha)",
  answerFeedback: "Feedback de cada alternativa (uma por linha, opcional)",
  correct:
    "Números das alternativas corretas (começando em 1, separados por vírgula)",
  mode: "Tipo de resposta",
  feedback: "Feedback geral",
  tags: "Tags",
  shuffle: "Embaralhar alternativas",
};

function createMoodleQuizForm() {
  var form = FormApp.create("Questões de múltipla escolha para o Moodle");
  form.setDescription(
    "Envie uma questão por resposta. Digite cada alternativa em uma linha separada. " +
      "Os números das respostas corretas correspondem às alternativas não vazias, começando em 1. " +
      "O campo de texto aceita marcação HTML para formatação.",
  );

  form.addTextItem().setTitle(FIELD_TITLES.name);
  form
    .addParagraphTextItem()
    .setTitle(FIELD_TITLES.question)
    .setHelpText(
      "O Google Forms não oferece editor visual neste campo. Digite HTML para formatar o texto, por exemplo: <p>, <strong>, <em>, <ul> e <li>.",
    )
    .setRequired(true);
  form.addParagraphTextItem().setTitle(FIELD_TITLES.answers).setRequired(true);
  form
    .addParagraphTextItem()
    .setTitle(FIELD_TITLES.answerFeedback)
    .setHelpText(
      "Informe um feedback por alternativa, na mesma ordem. Deixe a linha vazia para uma alternativa sem feedback; este campo é opcional. Aceita HTML, como <p>, <strong> e <em>.",
    );
  form.addTextItem().setTitle(FIELD_TITLES.correct).setRequired(true);
  form
    .addListItem()
    .setTitle(FIELD_TITLES.mode)
    .setChoiceValues(["Apenas uma resposta", "Múltiplas respostas permitidas"])
    .setRequired(true);
  form
    .addParagraphTextItem()
    .setTitle(FIELD_TITLES.feedback)
    .setHelpText(
      "Opcional. Aceita HTML para formatação, como <p>, <strong>, <em>, <ul> e <li>.",
    );
  form
    .addTextItem()
    .setTitle(FIELD_TITLES.tags)
    .setHelpText(
      "Opcional. Separe as tags por vírgula ou em linhas diferentes.",
    );
  form
    .addListItem()
    .setTitle(FIELD_TITLES.shuffle)
    .setChoiceValues(["Sim", "Não"])
    .setRequired(true);
  var spreadsheet = SpreadsheetApp.create(
    "Respostas do formulário de questões Moodle",
  );
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  PropertiesService.getScriptProperties().setProperty(
    FORM_ID_PROPERTY,
    form.getId(),
  );

  ScriptApp.newTrigger("handleMoodleFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("Link para editar o formulário: " + form.getEditUrl());
  Logger.log("Link para responder ao formulário: " + form.getPublishedUrl());
  Logger.log("Planilha de respostas: " + spreadsheet.getUrl());
  return form.getEditUrl();
}

function updateMoodleQuizForm() {
  var formId =
    PropertiesService.getScriptProperties().getProperty(FORM_ID_PROPERTY);
  if (!formId) {
    throw new Error(
      "Nenhum formulário configurado. Execute createMoodleQuizForm() primeiro.",
    );
  }

  var form = FormApp.openById(formId);
  form
    .setTitle("Questões de múltipla escolha para o Moodle")
    .setDescription(
      "Envie uma questão por resposta. Digite cada alternativa em uma linha separada. " +
        "Os números das respostas corretas correspondem às alternativas não vazias, começando em 1. " +
        "O campo de texto aceita marcação HTML para formatação.",
    );

  updateTextItem(form, FIELD_TITLES.name, false, "");
  updateParagraphItem(
    form,
    FIELD_TITLES.question,
    true,
    "O Google Forms não oferece editor visual neste campo. Digite HTML para formatar o texto, por exemplo: <p>, <strong>, <em>, <ul> e <li>.",
  );
  updateParagraphItem(form, FIELD_TITLES.answers, true, "");
  updateParagraphItem(
    form,
    FIELD_TITLES.answerFeedback,
    false,
    "Informe um feedback por alternativa, na mesma ordem. Deixe a linha vazia para uma alternativa sem feedback; este campo é opcional. Aceita HTML, como <p>, <strong> e <em>.",
  );
  updateTextItem(form, FIELD_TITLES.correct, true, "");
  updateListItem(form, FIELD_TITLES.mode, [
    "Apenas uma resposta",
    "Múltiplas respostas permitidas",
  ]);
  updateParagraphItem(
    form,
    FIELD_TITLES.feedback,
    false,
    "Opcional. Aceita HTML para formatação, como <p>, <strong>, <em>, <ul> e <li>.",
  );
  updateTextItem(
    form,
    FIELD_TITLES.tags,
    false,
    "Opcional. Separe as tags por vírgula ou em linhas diferentes.",
  );
  updateListItem(form, FIELD_TITLES.shuffle, ["Sim", "Não"]);

  var destinationId = form.getDestinationId();
  if (destinationId) {
    Logger.log("Destino de respostas mantido: " + destinationId);
  } else {
    Logger.log("O formulário não possui destino de respostas vinculado.");
  }
  Logger.log("Formulário atualizado: " + form.getEditUrl());
  Logger.log("Link para responder ao formulário: " + form.getPublishedUrl());
  return form.getEditUrl();
}

function updateTextItem(form, title, required, helpText) {
  var item = findOrAddFormItem(form, title, FormApp.ItemType.TEXT, function () {
    return form.addTextItem();
  }).asTextItem();
  item.setTitle(title).setRequired(required).setHelpText(helpText);
}

function updateParagraphItem(form, title, required, helpText) {
  var item = findOrAddFormItem(
    form,
    title,
    FormApp.ItemType.PARAGRAPH_TEXT,
    function () {
      return form.addParagraphTextItem();
    },
  ).asParagraphTextItem();
  item.setTitle(title).setRequired(required).setHelpText(helpText);
}

function updateListItem(form, title, choices) {
  var item = findOrAddFormItem(form, title, FormApp.ItemType.LIST, function () {
    return form.addListItem();
  }).asListItem();
  item.setTitle(title).setChoiceValues(choices).setRequired(true);
}

function findOrAddFormItem(form, title, itemType, createItem) {
  var matches = form.getItems().filter(function (item) {
    return item.getTitle() === title;
  });
  if (matches.length > 1) {
    throw new Error('Há mais de uma pergunta com o título "' + title + '".');
  }
  if (matches.length === 0) {
    var createdItem = createItem().setTitle(title);
    return form.getItemById(createdItem.getId());
  }
  if (matches[0].getType() !== itemType) {
    throw new Error(
      'A pergunta "' + title + '" existe com um tipo incompatível.',
    );
  }
  return matches[0];
}

function handleMoodleFormSubmit(event) {
  if (!event || !event.response) {
    throw new Error(
      "Esta função é executada pelo acionador de envio do formulário.",
    );
  }
  exportMoodleXml();
}

function exportMoodleXml() {
  var formId =
    PropertiesService.getScriptProperties().getProperty(FORM_ID_PROPERTY);
  if (!formId) {
    throw new Error("Execute createMoodleQuizForm() primeiro.");
  }

  var form = FormApp.openById(formId);
  var questions = readResponseSpreadsheet(form);
  var xml = buildMoodleXml(questions);
  var properties = PropertiesService.getScriptProperties();
  var outputId = properties.getProperty(OUTPUT_FILE_ID_PROPERTY);
  var outputFile;

  if (outputId) {
    try {
      outputFile = DriveApp.getFileById(outputId);
      outputFile.setContent(xml);
    } catch (error) {
      outputFile = null;
    }
  }
  if (!outputFile) {
    outputFile = DriveApp.createFile("moodle-quiz.xml", xml, "application/xml");
    properties.setProperty(OUTPUT_FILE_ID_PROPERTY, outputFile.getId());
  }

  Logger.log("Arquivo XML do Moodle: " + outputFile.getUrl());
  return outputFile.getUrl();
}

function readResponseSpreadsheet(form) {
  var spreadsheetId = form.getDestinationId();
  if (!spreadsheetId) {
    throw new Error(
      "O formulário não está vinculado a uma planilha de respostas. Vincule uma planilha e tente novamente.",
    );
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var requiredHeaders = [
    FIELD_TITLES.question,
    FIELD_TITLES.answers,
    FIELD_TITLES.correct,
    FIELD_TITLES.mode,
  ];
  var responseData = null;
  var responseHeaders = null;
  var responseSheetName = "";

  spreadsheet.getSheets().some(function (sheet) {
    var data = sheet.getDataRange().getValues();
    var headers = data.length
      ? data[0].map(function (header) {
          return String(header).trim();
        })
      : [];
    var hasRequiredHeaders = requiredHeaders.every(function (header) {
      return headers.indexOf(header) !== -1;
    });
    if (hasRequiredHeaders) {
      responseData = data;
      responseHeaders = headers;
      responseSheetName = sheet.getName();
      return true;
    }
    return false;
  });

  if (!responseData) {
    throw new Error(
      "Não encontrei a aba de respostas esperada na planilha vinculada ao formulário.",
    );
  }

  var responseRows = responseData.slice(1).filter(function (row) {
    return row.some(function (value) {
      return value !== "" && value !== null;
    });
  });
  var questions = responseRows.map(function (row, index) {
    var values = {};
    responseHeaders.forEach(function (header, columnIndex) {
      values[header] = row[columnIndex];
    });
    return parseResponseValues(values, index + 1);
  });

  Logger.log(
    "Respostas lidas da planilha " +
      spreadsheet.getName() +
      ", aba " +
      responseSheetName +
      ": " +
      questions.length,
  );
  return questions;
}

function parseResponse(response, questionNumber) {
  var values = {};
  response.getItemResponses().forEach(function (itemResponse) {
    values[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  });
  return parseResponseValues(values, questionNumber);
}

function parseResponseValues(values, questionNumber) {
  var answers = String(values[FIELD_TITLES.answers] || "")
    .split(/\r?\n/)
    .map(function (answer) {
      return answer.trim();
    })
    .filter(function (answer) {
      return answer.length > 0;
    });
  var answerFeedbackLines = String(
    values[FIELD_TITLES.answerFeedback] || "",
  ).split(/\r?\n/);
  var answerFeedbacks = answers.map(function (answer, index) {
    return String(answerFeedbackLines[index] || "").trim();
  });
  if (answers.length < 2) {
    throw new Error(
      "A questão " +
        questionNumber +
        " precisa ter pelo menos duas alternativas não vazias.",
    );
  }

  var correctIndexes = String(values[FIELD_TITLES.correct] || "")
    .split(",")
    .map(function (index) {
      return Number(index.trim());
    });
  if (
    !correctIndexes.length ||
    correctIndexes.some(function (index) {
      return !Number.isInteger(index) || index < 1 || index > answers.length;
    })
  ) {
    throw new Error(
      "A questão " +
        questionNumber +
        " tem um número de resposta correta inválido.",
    );
  }
  correctIndexes = correctIndexes.filter(function (index, position, all) {
    return all.indexOf(index) === position;
  });

  var isSingle = values[FIELD_TITLES.mode] === "Apenas uma resposta";
  if (isSingle && correctIndexes.length !== 1) {
    throw new Error(
      "A questão " +
        questionNumber +
        " está configurada como resposta única, mas não tem exatamente uma alternativa correta.",
    );
  }

  var tags = String(values[FIELD_TITLES.tags] || "")
    .split(/[\r\n,]+/)
    .map(function (tag) {
      return tag.trim();
    })
    .filter(function (tag) {
      return tag.length > 0;
    });

  return {
    name:
      String(values[FIELD_TITLES.name] || "").trim() ||
      "Questão " + questionNumber,
    text: String(values[FIELD_TITLES.question] || ""),
    answers: answers,
    answerFeedbacks: answerFeedbacks,
    correctIndexes: correctIndexes,
    single: isSingle,
    feedback: String(values[FIELD_TITLES.feedback] || ""),
    tags: tags,
    shuffle: values[FIELD_TITLES.shuffle] === "Sim",
    grade: DEFAULT_QUESTION_GRADE,
    penalty: DEFAULT_QUESTION_PENALTY,
  };
}

function buildMoodleXml(questions) {
  var quiz = XmlService.createElement("quiz");
  questions.forEach(function (question) {
    quiz.addContent(buildQuestionElement(question));
  });
  var document = XmlService.createDocument(quiz);
  return XmlService.getPrettyFormat().setIndent("  ").format(document);
}

function buildQuestionElement(question) {
  var questionElement = XmlService.createElement("question").setAttribute(
    "type",
    "multichoice",
  );
  var questionName = XmlService.createElement("name");
  addTextElement(questionName, "text", question.name);
  questionElement.addContent(questionName);

  var questionText = XmlService.createElement("questiontext").setAttribute(
    "format",
    "html",
  );
  addTextElement(questionText, "text", question.text);
  questionElement.addContent(questionText);

  var generalFeedback = XmlService.createElement(
    "generalfeedback",
  ).setAttribute("format", "html");
  addTextElement(generalFeedback, "text", question.feedback);
  questionElement.addContent(generalFeedback);

  addTextElement(
    questionElement,
    "defaultgrade",
    formatDecimal(question.grade),
  );
  addTextElement(questionElement, "penalty", formatDecimal(question.penalty));
  addTextElement(questionElement, "hidden", "0");
  addTextElement(questionElement, "single", question.single ? "true" : "false");
  addTextElement(
    questionElement,
    "shuffleanswers",
    question.shuffle ? "true" : "false",
  );
  addTextElement(questionElement, "answernumbering", "abc");
  addTextElement(questionElement, "showstandardinstruction", "0");

  if (question.tags && question.tags.length) {
    var tagsElement = XmlService.createElement("tags");
    question.tags.forEach(function (tag) {
      var tagElement = XmlService.createElement("tag");
      addTextElement(tagElement, "text", tag);
      tagsElement.addContent(tagElement);
    });
    questionElement.addContent(tagsElement);
  }

  var incorrectCount = question.answers.length - question.correctIndexes.length;
  var correctFraction = 100 / question.correctIndexes.length;
  var incorrectFraction = incorrectCount ? -100 / incorrectCount : 0;
  question.answers.forEach(function (answer, index) {
    var isCorrect = question.correctIndexes.indexOf(index + 1) !== -1;
    var answerElement = XmlService.createElement("answer")
      .setAttribute(
        "fraction",
        formatDecimal(isCorrect ? correctFraction : incorrectFraction),
      )
      .setAttribute("format", "html");
    addTextElement(answerElement, "text", answer);
    var feedback = XmlService.createElement("feedback").setAttribute(
      "format",
      "html",
    );
    addTextElement(feedback, "text", question.answerFeedbacks[index] || "");
    answerElement.addContent(feedback);
    questionElement.addContent(answerElement);
  });

  addFeedbackElement(questionElement, "correctfeedback");
  addFeedbackElement(questionElement, "partiallycorrectfeedback");
  addFeedbackElement(questionElement, "incorrectfeedback");
  addTextElement(questionElement, "shownumcorrect", "0");
  return questionElement;
}

function addFeedbackElement(parent, name) {
  var feedback = XmlService.createElement(name).setAttribute("format", "html");
  addTextElement(feedback, "text", "");
  parent.addContent(feedback);
}

function addTextElement(parent, name, value) {
  parent.addContent(XmlService.createElement(name).setText(String(value)));
}

function formatDecimal(value) {
  return Number(value).toFixed(7);
}

function logMoodleFormId() {
  var formId =
    PropertiesService.getScriptProperties().getProperty(FORM_ID_PROPERTY);
  Logger.log("Form ID: " + formId);
  return formId;
}

function logMoodleXmlFileId() {
  var fileId = PropertiesService.getScriptProperties().getProperty(
    OUTPUT_FILE_ID_PROPERTY,
  );
  Logger.log("Moodle XML file ID: " + fileId);
  return fileId;
}
