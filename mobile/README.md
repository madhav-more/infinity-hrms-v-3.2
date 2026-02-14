



// 


dashboard screen for the employee



api:
http://192.168.1.75:5000/api/employees/dashboard/41?month=1&year=2026


backend response:

{
    "employee": {
        "id": 41,
        "employeeCode": "IA00022",
        "name": "AKANKSHA GANPAT PHADATARE",
        "email": "AKANKSHAPHADATARE@GMAIL.COM",
        "mobileNumber": "9545595063",
        "alternateMobileNumber": "9923726358",
        "password": "123456",
        "confirmPassword": null,
        "gender": "Female",
        "fatherName": "GANPAT",
        "motherName": "SANGITA",
        "doB_Date": "2002-04-25T00:00:00",
        "maritalStatus": "Single",
        "experienceType": "Fresher",
        "totalExperienceYears": 0,
        "experienceCertificateFilePath": "-",
        "lastCompanyName": "-",
        "joiningDate": "2025-03-03T00:00:00",
        "department": "IT",
        "position": "SENIOR SOFTWARE DEVELOPER",
        "salary": 15000.00,
        "reportingManager": "abc",
        "managerId": 36,
        "role": "Manager",
        "address": "RAVET, PUNE",
        "permanentAddress": "WALAYANKIT APP FLAT NO 8, SURYANAGRI, BARAMATI",
        "hscPercent": 0.00,
        "graduationCourse": "BCA",
        "graduationPercent": 75.00,
        "postGraduationCourse": "MCA",
        "postGraduationPercent": 0.00,
        "aadhaarNumber": "385022178079",
        "panNumber": "GBRPP5051G",
        "accountHolderName": "AKANKSHA GANPAT PHADATARE",
        "bankName": "BANK OF MAHARASHTRA",
        "accountNumber": "60381133427",
        "ifsc": "MAHB0001409",
        "branch": "BARAMATI",
        "profileImagePath": "Profile_20251212144015.jpeg",
        "aadhaarFilePath": "-",
        "panFilePath": "-",
        "passbookFilePath": "-",
        "tenthMarksheetFilePath": "-",
        "twelfthMarksheetFilePath": "-",
        "graduationMarksheetFilePath": "-",
        "postGraduationMarksheetFilePath": "-",
        "medicalDocumentFilePath": "-",
        "emergencyContactName": "-",
        "emergencyContactRelationship": "-",
        "emergencyContactMobile": "-",
        "emergencyContactAddress": "-",
        "hasDisease": "No",
        "diseaseName": "-",
        "diseaseType": "-",
        "diseaseSince": "-",
        "medicinesRequired": "-",
        "doctorName": "-",
        "doctorContact": "-",
        "lastAffectedDate": "-",
        "createdAt": "2025-11-20T12:09:09.697",
        "status": "Active",
        "deactiveReason": null,
        "compOffBalance": 0,
        "lastCompOffEarnedDate": null,
        "passwordHash": null,
        "failedLoginAttempts": null,
        "lockoutEndUtc": null
    },
    "workingDays": 27,
    "presentDays": 9,
    "leaveDays": 1,
    "holidayDays": 1,
    "absentDays": 16,
    "month": 1,
    "year": 2026
}



display this in proper way

1. Top Card – Employee Name

A card at the top displaying:

Employee Name (large text)

Optional: Employee Code or Role

🔷 2. Action Buttons (Below Name Card)
handles the proper navigation to this pages:
Display 4 buttons:

Mark Attendance 

Attendance Summary

Apply Leaves

View Salary Slip

Buttons must:

Be well styled

Have proper navigation placeholders

Be evenly spaced

Be responsive

🔷 3. Employee Info Card

A large card displaying:

Department

Position

Total Leaves (leaveDays)

Approved Leaves (you can use leaveDays for now if not separate)

🔷 4. Celebrations Card 🎉

A separate card showing:

Today’s Birthday (if employee DOB matches today)

Tomorrow’s Birthday (if matches tomorrow)

You must calculate this from:

employee.doB_Date


Properly parse the date and compare only day & month.

🏗 Technical Requirements

You must:

Use functional components

Use Hooks (useEffect, useState)

Use proper loading state

Handle API errors gracefully

Show ActivityIndicator while loading

Use clean card-based UI

Use modern styling









// WE HAVE TO IMPLEMENT THE FUNCTIOnlities for  hr


1) employee management 

2) attendance

3) leave management

4) leave approvals

in employee management:

show all the employee details in proper table format ;

columns : Employee Code	Name	Email	Department	Position	Mobile No	Joining Date	Actions	Status

api: http://192.168.1.75:5000/api/employees

backend response :

[
    {
        "id": 20,
        "employeeCode": "IA00001",
        "name": "RAHUL ASHOK KANGANE",
        "email": "kangane.rahul@gmail.com",
        "mobileNumber": "9004749899",
        "alternateMobileNumber": "8956554833",
        "password": "123456",
        "confirmPassword": null,
        "gender": "Male",
        "fatherName": "ASHOK",
        "motherName": "VIMAL",
        "doB_Date": "1988-04-26T00:00:00",
        "maritalStatus": "Married",
        "experienceType": "Experienced",
        "totalExperienceYears": 0,
        "experienceCertificateFilePath": "-",
        "lastCompanyName": "-",
        "joiningDate": "2025-03-03T00:00:00",
        "department": "DIRECTOR",
        "position": "Director",
        "salary": 200000.00,
        "reportingManager": "abc",
        "managerId": 36,
        "role": "Director",
        "address": "602 MADHAVACHAYA MORDEN COLONY SHIVAJI NAGAR PUNE 411016",
        "permanentAddress": "602 MADHAVACHAYA MORDEN COLONY SHIVAJI NAGAR PUNE 411016",
        "hscPercent": 58.00,
        "graduationCourse": "BCA",
        "graduationPercent": 78.00,
        "postGraduationCourse": "None",
        "postGraduationPercent": 56.00,
        "aadhaarNumber": "712145802350",
        "panNumber": "CGEPK7155G",
        "accountHolderName": "-",
        "bankName": "-",
        "accountNumber": "-",
        "ifsc": "0",
        "branch": "-",
        "profileImagePath": "-",
        "aadhaarFilePath": "-",
        "panFilePath": "-",
        "passbookFilePath": "-",
        "tenthMarksheetFilePath": "-",
        "twelfthMarksheetFilePath": "-",
        "graduationMarksheetFilePath": "-",
        "postGraduationMarksheetFilePath": "-",
        "medicalDocumentFilePath": "-",
        "emergencyContactName": "KANCHAN RAHUL KANGANE ",
        "emergencyContactRelationship": "SPOUSE",
        "emergencyContactMobile": "8369066147",
        "emergencyContactAddress": "SAME AS ABOVE",
        "hasDisease": "No",
        "diseaseName": "-",
        "diseaseType": "-",
        "diseaseSince": "-",
        "medicinesRequired": "-",
        "doctorName": "-",
        "doctorContact": "-",
        "lastAffectedDate": "-",
        "createdAt": "2025-11-20T12:09:09.697",
        "status": "Active",
        "deactiveReason": null,
        "compOffBalance": 0,
        "lastCompOffEarnedDate": null,
        "passwordHash": null,
        "failedLoginAttempts": 1,
        "lockoutEndUtc": "2026-01-16T11:24:03.0203642"
    },


in this same screen in the action columns ;

2 options one is view and other is  edit

view the partuicular emplolyee details;

api: http://192.168.1.75:5000/api/employees/20

backend response :

{
    "id": 20,
    "employeeCode": "IA00001",
    "name": "RAHUL ASHOK KANGANE",
    "email": "kangane.rahul@gmail.com",
    "mobileNumber": "9004749899",
    "alternateMobileNumber": "8956554833",
    "password": "123456",
    "confirmPassword": null,
    "gender": "Male",
    "fatherName": "ASHOK",
    "motherName": "VIMAL",
    "doB_Date": "1988-04-26T00:00:00",
    "maritalStatus": "Married",
    "experienceType": "Experienced",
    "totalExperienceYears": 0,
    "experienceCertificateFilePath": "-",
    "lastCompanyName": "-",
    "joiningDate": "2025-03-03T00:00:00",
    "department": "DIRECTOR",
    "position": "Director",
    "salary": 200000.00,
    "reportingManager": "abc",
    "managerId": 36,
    "role": "Director",
    "address": "602 MADHAVACHAYA MORDEN COLONY SHIVAJI NAGAR PUNE 411016",
    "permanentAddress": "602 MADHAVACHAYA MORDEN COLONY SHIVAJI NAGAR PUNE 411016",
    "hscPercent": 58.00,
    "graduationCourse": "BCA",
    "graduationPercent": 78.00,
    "postGraduationCourse": "None",
    "postGraduationPercent": 56.00,
    "aadhaarNumber": "712145802350",
    "panNumber": "CGEPK7155G",
    "accountHolderName": "-",
    "bankName": "-",
    "accountNumber": "-",
    "ifsc": "0",
    "branch": "-",
    "profileImagePath": "-",
    "aadhaarFilePath": "-",
    "panFilePath": "-",
    "passbookFilePath": "-",
    "tenthMarksheetFilePath": "-",
    "twelfthMarksheetFilePath": "-",
    "graduationMarksheetFilePath": "-",
    "postGraduationMarksheetFilePath": "-",
    "medicalDocumentFilePath": "-",
    "emergencyContactName": "KANCHAN RAHUL KANGANE ",
    "emergencyContactRelationship": "SPOUSE",
    "emergencyContactMobile": "8369066147",
    "emergencyContactAddress": "SAME AS ABOVE",
    "hasDisease": "No",
    "diseaseName": "-",
    "diseaseType": "-",
    "diseaseSince": "-",
    "medicinesRequired": "-",
    "doctorName": "-",
    "doctorContact": "-",
    "lastAffectedDate": "-",
    "createdAt": "2025-11-20T12:09:09.697",
    "status": "Active",
    "deactiveReason": null,
    "compOffBalance": 0,
    "lastCompOffEarnedDate": null,
    "passwordHash": null,
    "failedLoginAttempts": 1,
    "lockoutEndUtc": "2026-01-16T11:24:03.0203642"
}


for now skip the  update functionlity for the employee







after implement the attendance management in hr side

api: http://192.168.1.75:5000/api/Attendance/my-summary


backend response :

{
    "employee": {
        "id": 110,
        "name": "VANITA SARKATE",
        "employeeCode": "IA00091"
    },
    "records": [
        {
            "date": "2026-02-12T00:00:00",
            "inTime": "10:30",
            "outTime": null,
            "workingHours": "--",
            "status": "P",
            "correctionStatus": "None",
            "token": "wHFYl9zkWYjlSabErgketwdXAeSxa5FjZWISWhLVY6MJDWkxcIRCTwS7Pvqdjo8XPLCa6sfS8vEvBRm8KuWMvg"
        }
    ]
}

show the data in proper table format 


coilumns: 
Employee Code	Name	Date	Check In	Check Out	Total Hours	Status

IA00001	RAHUL ASHOK KANGANE	14-02-2026	--	--	--	Absent		
IA00002	RAJESH PARKHI	14-02-2026	--	--	--	Absent	
IA00003	PRAVIN MARATHE	14-02-2026	--	--	--	Absent
IA00004	ASHWINI BHIMRAO KAMBLE	14-02-2026	10:00	--	--	Not Checked Out
IA00005	SHWETA AJAY DALVI	14-02-2026	10:30	--	--	Not Checked Out	
IA00014	VRUSHALI U HIRVE	14-02-2026	10:00	--	--	Not Checked Out



in the same screen the functiolity for the attence corrections request 


api:http://192.168.1.75:5000/api/Attendance/correction-requests

backend response :


{
    "total": 31,
    "requests": [
        {
            "emp_Code": "IA00085",
            "date": "2026-02-14T00:00:00",
            "correctionRemark": "Please correct it",
            "correctionStatus": "Pending",
            "correctionRequestedOn": "2026-02-14T10:27:52.793",
            "correctionProofPath": null
        },
        {
            "emp_Code": "IA00094",
            "date": "2026-02-14T00:00:00",
            "correctionRemark": "Please correct it",
            "correctionStatus": "Approved",
            "correctionRequestedOn": "2026-02-14T11:19:38.573",
            "correctionProofPath": null
        },
        {
            "emp_Code": "IA00088",
            "date": "2026-01-24T00:00:00",
            "correctionRemark": "test",
            "correctionStatus": "Pending",
            "correctionRequestedOn": "2026-01-24T11:08:23.483",
            "correctionProofPath": null
        },
        {
            "emp_Code": "IA00092",
            "date": "2026-01-18T00:00:00",
            "correctionRemark": "curect my in and out time",
            "correctionStatus": "Pending",
            "correctionRequestedOn": "2026-01-20T12:05:33.243",
            "correctionProofPath": null
        },
        {


for now skip the attendace correction functility hr side


// leave management









2) attendance summary hr side


api:http://192.168.1.75:5000/api/Attendance/my-summary

backend response : 


{
    "employee": {
        "id": 110,
        "name": "VANITA SARKATE",
        "employeeCode": "IA00091"
    },
    "records": [
        {
            "date": "2026-02-12T00:00:00",
            "inTime": "10:30",
            "outTime": null,
            "workingHours": "--",
            "status": "P",
            "correctionStatus": "None",
            "token": "wHFYl9zkWYjlSabErgketwdXAeSxa5FjZWISWhLVY6MJDWkxcIRCTwS7Pvqdjo8XjlWLlLsnaeXniz0rJ4wcDQ"
        }
    ]
}

attendance sacreen hr side:

in proper table formtats 

columns :


Employee Code	Name	Date	Check In	Check Out	Total Hours	Status	Ticket	

it should display like this :

IA00001	RAHUL ASHOK KANGANE	14-02-2026	--	--	--	Absent	No Ticket	
IA00002	RAJESH PARKHI	14-02-2026	--	--	--	Absent	No Ticket	
IA00003	PRAVIN MARATHE	14-02-2026	--	--	--	Absent	No Ticket	
IA00004	ASHWINI BHIMRAO KAMBLE	14-02-2026	10:00	--	--	Not Checked Out	No Ticket	
IA00005	SHWETA AJAY DALVI	14-02-2026	10:30	--	--	Not Checked Out	No Ticket










CREATE EMPLOYEE FUNCTIONLITY:



API: http://192.168.1.75:5000/api/employees

FILES:

EmployeesController.CS













// LEAVE MANAGEMENT HR SIDE

API: http://192.168.1.75:5000/api/Leave/pending

BACKEND RESPONSE : [
    {
        "id": 111,
        "employeeId": 115,
        "employee": {
            "id": 115,
            "employeeCode": "IA00096",
            "name": "RISHIKESH SAHASRABUDHE",
            "email": "SRISHIKESH1302@GMAIL.COM",
            "mobileNumber": "9823272731",
            "alternateMobileNumber": "9370276470",
            "password": "123456",
            "confirmPassword": null,
            "gender": "Male",
            "fatherName": "VASANT",
            "motherName": "JAYSHREE",
            "doB_Date": "1978-02-13T00:00:00",
            "maritalStatus": "Single",
            "experienceType": "Experienced",
            "totalExperienceYears": 15,
            "experienceCertificateFilePath": "Experience_20251203105726.pdf",
            "lastCompanyName": "KFIN TECHNOLOGIES LTD",
            "joiningDate": "2025-11-10T00:00:00",
            "department": "FINANCE",
            "position": "SALES MANAGER",
            "salary": 25000.00,
            "reportingManager": "abc",
            "managerId": 36,
            "role": "Manager",
            "address": "FLAT NO.2 SIDDHA TERRACE, BHUSARI COLONY, OPP.PMT BUS DEPOT, PAUD ROAD, KOTHRUD PUNE-411038",
            "permanentAddress": "FLAT NO.2 SIDDHA TERRACE, BHUSARI COLONY, OPP.PMT BUS DEPOT, PAUD ROAD, KOTHRUD PUNE-411038",
            "hscPercent": 65.00,
            "graduationCourse": "B.Com",
            "graduationPercent": 66.00,
            "postGraduationCourse": "Other",
            "postGraduationPercent": 67.00,
            "aadhaarNumber": "333410049641",
            "panNumber": "BEPPS1552F",
            "accountHolderName": "RISHIKESH VASANT SAHASRABUDHE",
            "bankName": "HDFC BANK LTD",
            "accountNumber": "50100464273667",
            "ifsc": "HDFC0001793",
            "branch": "PUNE",
            "profileImagePath": "-",
            "aadhaarFilePath": "Aadhaar_20251203105726.png",
            "panFilePath": "Pan_20251203105726.png",
            "passbookFilePath": "Passbook_20251203105726.jpeg",
            "tenthMarksheetFilePath": "-",
            "twelfthMarksheetFilePath": "Twelfth_20251203105726.png",
            "graduationMarksheetFilePath": "Graduation_20251203105726.png",
            "postGraduationMarksheetFilePath": "PG_20251203105726.pdf",
            "medicalDocumentFilePath": "-",
            "emergencyContactName": "MANJIRI ANAND BHAVE",
            "emergencyContactRelationship": "SISTER",
            "emergencyContactMobile": "9370276470",
            "emergencyContactAddress": "FLAT NO 1, HIMACHAL APARTMENTS, LANE NO.7, DAHANUKAR COLONY KOTHRUD PUNE-411028",
            "hasDisease": "No",
            "diseaseName": "-",
            "diseaseType": "-",
            "diseaseSince": "-",
            "medicinesRequired": "-",
            "doctorName": "-",
            "doctorContact": "-",
            "lastAffectedDate": "-",
            "createdAt": "2025-11-20T12:09:09.697",
            "status": "Active",
            "deactiveReason": null,
            "compOffBalance": 0,
            "lastCompOffEarnedDate": null,
            "passwordHash": null,
            "failedLoginAttempts": null,
            "lockoutEndUtc": null
        },
        "category": 1,
        "leaveType": "Sick",
        "startDate": "2026-01-05T00:00:00",
        "endDate": "2026-01-05T00:00:00",
        "halfDaySession": null,
        "timeValue": null,
        "contactDuringLeave": null,
        "addressDuringLeave": null,
        "totalDays": 1,
        "managerStatus": "Approved",
        "hrStatus": "Approved",
        "vpStatus": "Approved",
        "directorStatus": "Pending",
        "overallStatus": "Approved",
        "currentApproverRole": "VP",
        "nextApproverRole": "Completed",
        "createdOn": "2026-01-06T10:01:20.2703648",
        "managerRemark": null,
        "hrRemark": null,
        "vpRemark": null,
        "directorRemark": null,
        "reason": "Down with mild fever",
        "reportingManagerId": null,
        "isCompOff": false,
        "workDate": null
    },





    LEAVE APPROVE 


    API: http://192.168.1.75:5000/api/Leave/128/approve

    FILES : 


    LeaveController.CS






