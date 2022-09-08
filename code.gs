// ClientID = 97e78317-0500-4b28-94d5-c8ea2e2e6ef9
// Client Secret = yY2hF2nI7mM6yQ2tH5jE6hL8dE7bI4tR7cA8rR8hJ5qV0rC0bS
// GDrive Folder = 1fe90zLYyQHOqM4AYmBBmsyXaDK4-zRWz
const folderID = "1fe90zLYyQHOqM4AYmBBmsyXaDK4-zRWz";
const REGCOMPLIANCE = "1Xs6R6N9a6RhScv7Juh5lpQI0XgMPgWNT";
const COMPLAINTS = "19qe-cmKDzAePViiOURQyDMFfIe-NQNbG";
const mastersheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MasterData");
const regcompsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Regulatory Compliance");
const complaintsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Complaints/Violations");

function doGet(e) {
  //return HtmlService.createTemplateFromFile("UI").evaluate();
  if(e.parameters.v == "forms") {
    return render("forms",{});
  } else if (e.parameters.v == "complaints") {
    return render("complaints", {});
  } else if (e.parameters.v == "information") {
    return render("information", {});
  } else if(e.parameters.v == "mypage") {
    return render("samp",{});
  }
   else {
    return render("landing-page",{});
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
    mastersheet.appendRow([busID,data.BusinessName,	data.Region, data.Province, data.CityMunicipality, data.Baranggay, data.SubZoneVill, data.Street, data.UniRoomFlrBldg, data.LotBlkHNo, data.Email, data.Phone, data.MobileNum, data.RegSocSell, data.TIN, data.OnlinePres, "VLookUp", data.Category, "Sample URL", "Pending for Review"]);

    var brcUrl = saveInDrive(data.BRegCertBlob);
    var mpUrl = saveInDrive(data.MayorsPermitBlob);
    var bcUrl = saveInDrive(data.BaranggayCertBlob);
    
    regcompsheet.appendRow([busID, brcUrl, mpUrl, bcUrl, "Others"]);
    return "Success";
  } catch (e) {
    Logger.log(e);
    return null;
  }
}

function fileComplaint(data) {
  try {
    //Business ID	
    //Complainant Name	
    //Email	
    //Mobile	
    //Complain Description	
    //Attachments	
    //Validated
    complaintsheet.appendRow([data.busID, data.ComplainantName, data.Email, data.Mobile, data.ComplainDesc, data.Attachments, data.Validated]);
    return "Success";
  } catch (e) {
    Logger.log(e)
    return null;
  }
}

function getRecords() {
  try {
    var dataRange = mastersheet.getRange(3,1,sheet.getLastRow() - 2,sheet.getLastColumn()).getValues();
    Logger.log(dataRange);
    return dataRange;
  } catch (e) {
    Logger.log(e);
  }
}

function saveInDrive(f) {
  Logger.log(f);
  var blob = Utilities.newBlob(f.bytes,f.mimeType,f.filename);
  var resource = {
    title: f.filename,
    mimeType: f.mimeType,
    parents: [{ id: folderID}]
  };
  var file = Drive.Files.insert(resource, blob,{
    supportsAllDrives: true,
    sendNotificationEmails: false
  });
  var fileURL = file.alternateLink;
  Logger.log(fileURL);
  return fileURL;
}

function sendOTP(recipient) {
  try {
    recipient = "jakram.sangco@gmail.com";
    var otp = genRand(6);
    var recipient = recipient;
    var subject = "Online Business Registration OTP";
    var body = "Please use the following Code as part of the registration on our OBR System: " + otp;
    GmailApp.sendEmail(recipient,subject,body);
  } catch (e) {
    Logger.log(e);
  }
}

function genRand(count) {
  let alphNum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  Logger.log(alphNum);
  var rand = "";
  for(var i = 0; i < count; i++) {
    rand += alphNum.charAt(Math.floor(Math.random() * 32));
  }
  Logger.log(rand);
  return rand;
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function render(file,argsObject) {
  var tmp = HtmlService.createTemplateFromFile(file);
  if(argsObject) {
    var keys = Object.keys(argsObject);
    keys.forEach(function(key){
      tmp[key] = argsObject[key];
    });
  }
  return tmp.evaluate();
}

