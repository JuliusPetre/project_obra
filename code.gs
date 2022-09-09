// ClientID = 97e78317-0500-4b28-94d5-c8ea2e2e6ef9
// Client Secret = yY2hF2nI7mM6yQ2tH5jE6hL8dE7bI4tR7cA8rR8hJ5qV0rC0bS
// GDrive Folder = 1fe90zLYyQHOqM4AYmBBmsyXaDK4-zRWz
const folderID = "1fe90zLYyQHOqM4AYmBBmsyXaDK4-zRWz";
const REGCOMPLIANCE = "1Xs6R6N9a6RhScv7Juh5lpQI0XgMPgWNT";
const COMPLAINTS = "19qe-cmKDzAePViiOURQyDMFfIe-NQNbG";
const mastersheet =
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MasterData");
const regcompsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  "Regulatory Compliance"
);
const complaintsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
  "Complaints/Violations"
);
const badgeFileID = "1gZn9CCRtch_XicT-Di7fjGal0bkWDxQU";

function doGet(e) {
  //return HtmlService.createTemplateFromFile("UI").evaluate();
  if (e.parameters.v == "forms") {
    return render("forms", {});
  } else if (e.parameters.v == "platforms") {
    return render("platform", {});
  } else if (e.parameters.v == "complaints") {
    return render("complaints", {});
  } else if (e.parameters.v == "information") {
    return render("information", {});
  } else if (e.parameters.v == "mypage") {
    return render("samp", {});
  } else {
    return render("landing-page", {});
  }
}

function addRecord(data) {
  try {
    // Business ID
    //Business Name
    //Region
    //Province
    //City / Municipality
    //Baranggay
    //Subdivision/Zone/Village
    //StreetName
    //Uni/Room/Floor/BldgNo
    //Lot/Block/HouseNo
    //Email
    //Phone
    //Mobile Number
    //Registered/Social Seller
    //TIN
    //Online Presense
    //Complaints/Violations Count
    //Categroy
    //Badges URL
    //Status
    ///////////Regulatory Compliance///////////
    //Business Registraion Certificate
    //Mayors Permit
    //Barangay Certificate
    //Others
    var busID = genRand(12);
    mastersheet.appendRow([
      busID,
      data.BusinessName,
      data.Region,
      data.Province,
      data.CityMunicipality,
      data.Baranggay,
      data.SubZoneVill,
      data.Street,
      data.UniRoomFlrBldg,
      data.LotBlkHNo,
      data.Email,
      data.Phone,
      data.MobileNum,
      data.RegSocSell,
      data.TIN,
      data.OnlinePres,
      "VLookUp",
      data.Category,
      "Sample URL",
      "Pending for Review",
    ]);

    var brcUrl = saveInDrive(data.BRegCertBlob);
    var mpUrl = saveInDrive(data.MayorsPermitBlob);
    var bcUrl = saveInDrive(data.BaranggayCertBlob);

    regcompsheet.appendRow([busID, brcUrl, mpUrl, bcUrl, "Others"]);

    sendEmailOTP(data.Email);

    return "Success";
  } catch (e) {
    Logger.log(e);
    return null;
  }
}

function fileComplaint(data) {
  try {
    Logger.log(data);
    var attachmentURL = saveInDrive(data.Attachment);
    complaintsheet.appendRow([
      data.BusinessName,
      data.ReviewType,
      data.ComplainantName,
      data.Email,
      data.Mobile,
      data.ComplainDesc,
      attachmentURL,
      "Pending",
    ]);

    sendEmailReviewNotif(data.BusinessName);

    return "Success";
  } catch (e) {
    Logger.log(e);
    return null;
  }
}

function getRecords() {
  try {
    var dataRange = mastersheet
      .getRange(3, 1, sheet.getLastRow() - 2, sheet.getLastColumn())
      .getValues();
    Logger.log(dataRange);
    return dataRange;
  } catch (e) {
    Logger.log(e);
  }
}

function getBusinessNames() {
  try {
    var businessDetails = [];
    var items = {};
    var dataRange = mastersheet.getDataRange().getValues();
    for (var i = 0; i < dataRange.length; i++) {
      items.bID = dataRange[i][0];
      items.businessName = dataRange[i][1];
      items.email = dataRange[i][10];
      items.mobile = dataRange[i][12];
      items.category = dataRange[i][17];
      items.status = dataRange[i][19];
      businessDetails.push(items);
      items = {};
    }
    Logger.log(businessDetails);
    return businessDetails;
  } catch (e) {
    Logger.log(e);
  }
}

function getRegulatoryCompliance(bID) {
  try {
    var dataRange = regcompsheet.getDataRange().getValues();
    var items = {};
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        items.businessRegistrationCertificate = dataRange[i][1].toString();
        items.mayorsPermit = dataRange[i][2].toString();
        items.baranggayCertificate = dataRange[i][3].toString();
        break;
      }
    }
    return items;
  } catch (e) {
    Logger.log(e);
  }
}

function getReviews() {
  try {
    var dataRange = complaintsheet.getDataRange().getValues();
    var reviews = [];
    var items = {};
    for (var i = 1; i < dataRange.length; i++) {
      items.businessID = dataRange[i][0].toString();
      items.reviewType = dataRange[i][1].toString();
      items.reviewerName = dataRange[i][2].toString();
      items.email = dataRange[i][3].toString();
      items.mobile = dataRange[i][4].toString();
      items.reviewDescription = dataRange[i][5].toString();
      items.attachments = dataRange[i][6].toString();
      items.validated = dataRange[i][7].toString();
      reviews.push(items);
      items = {};
    }
    return reviews;
  } catch (e) {
    Logger.log(e);
  }
}

function approveBusinessRegistration(bID) {
  try {
    var dataRange = mastersheet
      .getRange(1, 1, mastersheet.getLastRow(), 2)
      .getValues();
    Logger.log(dataRange);
    var rowIndex = 0;
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        //Logger.log(dataRange[i][0].toString());
        rowIndex = i + 1;
        break;
      }
    }
    mastersheet.getRange(rowIndex, 20).setValue("Approved");
    sendRegistrationBadge(bID);
    return "Success";
  } catch (e) {
    Logger.log(e);
  }
}

function verifyReview(bID) {
  try {
    var dataRange = complaintsheet
      .getRange(1, 1, complaintsheet.getLastRow(), 1)
      .getValues();
    Logger.log(dataRange);
    var rowIndex = 0;
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        rowIndex = i + 1;
        break;
      }
    }
    complaintsheet.getRange(rowIndex, 8).setValue("Validated");
    sendEmailReviewResult(bID);
    return "Success";
  } catch (e) {
    Logger.log(e);
  }
}

function saveInDrive(f) {
  Logger.log(f);
  var blob = Utilities.newBlob(f.bytes, f.mimeType, f.filename);
  var resource = {
    title: f.filename,
    mimeType: f.mimeType,
    parents: [{ id: folderID }],
  };
  var file = Drive.Files.insert(resource, blob, {
    supportsAllDrives: true,
    sendNotificationEmails: false,
  });
  var fileURL = file.alternateLink;
  Logger.log(fileURL);
  return file.id;
}

function sendEmailReviewNotif(bID) {
  try {
    var dataRange = mastersheet.getDataRange().getValues();
    Logger.log(dataRange);
    var recipient = "";
    var businessName = "";
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        businessName = dataRange[i][1].toString();
        recipient = dataRange[i][10].toString();
        break;
      }
    }

    var subject = "Review Notif";
    var body =
      "A review with your registered business: " +
      businessName +
      " has been sent and is now pending for review";
    GmailApp.sendEmail(recipient, subject, body);
  } catch (e) {
    Logger.log(e);
  }
}

function sendEmailReviewResult(bID) {
  try {
    var dataRange = mastersheet.getDataRange().getValues();
    Logger.log(dataRange);
    var recipient = "";
    var businessName = "";
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        businessName = dataRange[i][1].toString();
        recipient = dataRange[i][10].toString();
        break;
      }
    }

    var subject = "Review Notif";
    var body =
      "A review with your registered business: " +
      businessName +
      " has been validated and is now reflected on your badge score";
    GmailApp.sendEmail(recipient, subject, body);
  } catch (e) {
    Logger.log(e);
  }
}

function sendEmailOTP(recipient) {
  try {
    //recipient = "jakram.sangco@gmail.com";
    var otp = genRand(6);
    var recipient = recipient;
    var subject = "Online Business Registration OTP";
    var body =
      "Please use the following Code as part of the registration on our OBR System: " +
      otp;
    GmailApp.sendEmail(recipient, subject, body, {
      cc: "punzalan.jehan@gmail.com",
    });
  } catch (e) {
    Logger.log(e);
  }
}

function sendRegistrationBadge(bID) {
  try {
    var dataRange = mastersheet.getDataRange().getValues();
    var recipient = "";
    for (var i = 0; i < dataRange.length; i++) {
      if (dataRange[i][0].toString() == bID) {
        recipient = dataRange[i][10].toString();
        break;
      }
    }
    var subject = "Online Business Registration Review Result";
    var body =
      "Your online business registration is approved. Attached is a basic entry level badge that you can use as you see fit";
    var attachment = DriveApp.getFileById(badgeFileID);
    GmailApp.sendEmail(recipient, subject, body, { attachments: [attachment] });
  } catch (e) {
    Logger.log(e);
  }
}

function genRand(count) {
  let alphNum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  Logger.log(alphNum);
  var rand = "";
  for (var i = 0; i < count; i++) {
    rand += alphNum.charAt(Math.floor(Math.random() * 32));
  }
  Logger.log(rand);
  return rand;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function render(file, argsObject) {
  var tmp = HtmlService.createTemplateFromFile(file);
  if (argsObject) {
    var keys = Object.keys(argsObject);
    keys.forEach(function (key) {
      tmp[key] = argsObject[key];
    });
  }
  return tmp.evaluate();
}

///////FOR UBX API CALLS//////////////////
function getAuthToken(mobileNum) {
  mobileNum = "639178675138";
  try {
    let htmlTblStat;

    var tableRequestURL =
      "https://api-uat.unionbankph.com/partners/sb/partners/v1/oauth2/token";

    var body = {
      grant_type: "password",
      client_id: "b33a78e6-4cfc-4903-b1d9-9bb6e739b69c",
      username: "partner_sb",
      password: "p@ssw0rd",
      scope: "otp",
    };
    var options = {
      payload: body,
      accept: "application/json",
      method: "post",
      //'content-type': 'application/x-www-form-urlencoded',
    };

    var response = UrlFetchApp.fetch(tableRequestURL, options);

    var jsonData = JSON.parse(response);
    //Logger.log(JSON.parse(response));
    //Logger.log(response);

    myObj = JSON.parse(response);

    atoken = jsonData.access_token;

    //Logger.log (atoken)

    sendOTP(atoken, mobileNum);
    return "Success";
  } catch (e) {
    Logger.log(e);
    return "Error";
  }
}

function sendOTP(authToken, mNum) {
  let htmlTblStat;

  var tableRequestURL =
    "https://api-uat.unionbankph.com/partners/sb/otp/v1/request";

  var body = {
    senderId: "UnionBank",
    mobileNumber: mNum,
  };
  var options = {
    headers: {
      authorization: "Bearer " + authToken,
      "x-ibm-client-id": "b33a78e6-4cfc-4903-b1d9-9bb6e739b69c",
      "x-ibm-client-secret":
        "eU2kS4qI8aY3fL1iF5cL0dY6oV2rK3sM8aT7kM8oO0lT7mG8eS",
      "x-partner-id": "5dff2cdf-ef15-48fb-a87b-375ebff415bb",
    },
    payload: JSON.stringify(body),
    method: "post",
    accept: "application/json",
    "content-type": "application/json",
  };
  Logger.log(options);
  var response = UrlFetchApp.fetch(tableRequestURL, options);

  var jsonData = JSON.parse(response);
  myObj = JSON.parse(response);

  reqID = jsonData.requestID;

  //validatePIN(reqID,pin)

  validatePIN("99aecec5075546cbaf2a87e9fb725532", "1111");
}

function validatePIN(requestID, pin) {
  let htmlTblStat;

  var tableRequestURL =
    "https://api-uat.unionbankph.com/partners/sb/otp/v1/verify";

  var body = {
    requestId: requestID,
    pin: pin,
  };
  var options = {
    headers: {
      authorization: "Bearer " + authToken,
      "x-ibm-client-id": "b33a78e6-4cfc-4903-b1d9-9bb6e739b69c",
      "x-ibm-client-secret":
        "eU2kS4qI8aY3fL1iF5cL0dY6oV2rK3sM8aT7kM8oO0lT7mG8eS",
      "x-partner-id": "5dff2cdf-ef15-48fb-a87b-375ebff415bb",
    },
    payload: JSON.stringify(body),
    method: "post",
    accept: "application/json",
    "content-type": "application/json",
  };
  Logger.log(options);
  var response = UrlFetchApp.fetch(tableRequestURL, options);

  var jsonData = JSON.parse(response);
  myObj = JSON.parse(response);

  msgPinValidate = jsonData.message;

  Logger.log(msgPinValidate);
}
