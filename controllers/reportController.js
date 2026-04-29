// controllers/reportController.js

const PDFDocument = require("pdfkit");
const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");

/* COLORS */
const COLOR = {
  header:'#0f2942',
  blue:'#185FA5',
  light:'#f5f8fc',
  text:'#1a1a2e',
  muted:'#6b7280',
  line:'#e4e8f0',
  present:'#166534',
  presentBg:'#dcfce7',
  absent:'#991b1b',
  absentBg:'#fee2e2',
  leave:'#92400e',
  leaveBg:'#fef3c7',
  half:'#1e40af',
  halfBg:'#dbeafe'
};

const W = 595.28;
const M = 40;

/* HELPERS */
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";

const fmtSalary = n =>
  n ? "₹ " + Number(n).toLocaleString("en-IN") : "—";

function box(doc,x,y,w,h,color){
  doc.save();
  doc.roundedRect(x,y,w,h,6).fill(color);
  doc.restore();
}

function label(doc,l,v,x,y){
  doc.fillColor(COLOR.muted).fontSize(8).text(l,x,y);
  doc.fillColor("#000").fontSize(10).text(v||"—",x,y+10);
}

function statusStyle(status){
  switch(status){
    case "Present": return [COLOR.present, COLOR.presentBg];
    case "Absent": return [COLOR.absent, COLOR.absentBg];
    case "Leave": return [COLOR.leave, COLOR.leaveBg];
    case "Half Day": return [COLOR.half, COLOR.halfBg];
    default: return ["#333","#eee"];
  }
}

/* MAIN */
const generateEmployeeReport = async (req,res)=>{
try{

  const employee = await Employee.findById(req.params.id);
  if(!employee){
    return res.status(404).json({message:"Employee not found"});
  }

  /* ✅ CORRECT QUERY (STRING MATCH) */
  const attendance = await Attendance.find({
    employeeId: employee.employeeId   // 🔥 IMPORTANT FIX
  }).sort({ date: -1 });

  /* COUNTS */
  let present=0,absent=0,leave=0;
  attendance.forEach(a=>{
    if(a.status==="Present" || a.status==="Half Day") present++;
    else if(a.status==="Absent") absent++;
    else if(a.status==="Leave") leave++;
  });

  const total = attendance.length;
  const percent = total ? Math.round((present/total)*100) : 0;

  /* PDF */
  const doc = new PDFDocument({size:"A4", margin:0});

  res.setHeader("Content-Type","application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${employee.name}.pdf"`
  );

  doc.pipe(res);

  /* HEADER */
  doc.rect(0,0,W,90).fill(COLOR.header);
  doc.fillColor("#fff").fontSize(20)
     .text("Employee Report",M,30);

  doc.fontSize(10)
     .text(`Generated: ${fmtDate(new Date())}`,M,60);

  /* NAME CARD */
  box(doc,M,100,W-80,70,COLOR.light);

  doc.fillColor("#000").fontSize(16)
     .text(employee.name,M+15,120);

  doc.fillColor("#666").fontSize(10)
     .text(
       `${employee.role || "—"} · ${employee.department || "—"}`,
       M+15,140
     );

  /* PERSONAL INFO */
  let y = 190;

  doc.fillColor(COLOR.blue).fontSize(12)
     .text("Personal Info",M,y);

  y+=20;
  label(doc,"DOB",fmtDate(employee.dateOfBirth),M,y);
  label(doc,"Father",employee.fatherName,M+250,y);

  y+=35;
  label(doc,"Mobile",employee.mobileNumber,M,y);
  label(doc,"Email",employee.emailId,M+250,y);

  y+=35;
  label(doc,"Address",employee.address,M,y);

  /* JOB DETAILS */
  y+=60;
  doc.fillColor(COLOR.blue).fontSize(12)
     .text("Job Details",M,y);

  y+=20;
  label(doc,"Role",employee.role,M,y);
  label(doc,"Department",employee.department,M+250,y);

  y+=35;
  label(doc,"Joining",fmtDate(employee.dateOfJoining),M,y);
  label(doc,"Manager",employee.reportingManager,M+250,y);

  y+=35;
  label(doc,"Salary",fmtSalary(employee.salary),M,y);


  /* BANK DETAILS */
y+=60;
doc.fillColor(COLOR.blue).fontSize(12)
   .text("Bank Details",M,y);

y+=20;
label(doc,"Bank Name",employee.bankName,M,y);
label(doc,"Account No",employee.accountNo,M+250,y);

y+=35;
label(doc,"IFSC",employee.ifsc,M,y);

  /* ATTENDANCE SUMMARY */
  y+=60;
  doc.fillColor(COLOR.blue).fontSize(12)
     .text("Attendance Summary",M,y);

  y+=20;

  doc.fillColor("#000").fontSize(10)
     .text(`Total: ${total}`,M,y)
     .text(`Present: ${present}`,M,y+15)
     .text(`Absent: ${absent}`,M,y+30)
     .text(`Leave: ${leave}`,M,y+45)
     .text(`Attendance: ${percent}%`,M,y+60);

  /* ATTENDANCE TABLE */
  y+=100;
  doc.fillColor(COLOR.blue).fontSize(12)
     .text("Attendance Records",M,y);

  y+=20;

  if(attendance.length===0){
    doc.fillColor("#666").text("No attendance records found",M,y);
  } else {

    attendance.forEach(a=>{
      if(y>750){
        doc.addPage();
        y=40;
      }

      const [textColor,bgColor] = statusStyle(a.status);

      box(doc,M,y,W-80,22,bgColor);

      doc.fillColor("#000").fontSize(9)
         .text(fmtDate(a.date),M+10,y+6)
         .text(a.checkInTime || "-",M+120,y+6)
         .text(a.checkOutTime || "-",M+220,y+6);

      doc.fillColor(textColor)
         .text(a.status,M+320,y+6);

      y+=26;
    });
  }

  doc.end();

}catch(err){
  console.error("PDF Error:",err);
  res.status(500).json({message:err.message});
}
};

module.exports = { generateEmployeeReport };