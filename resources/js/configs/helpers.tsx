import { format } from "date-fns"

export const countMonth=(date_start, date_end, with_one=false)=>{
    const date1=new Date(date_start)
    const date2=new Date(date_end)

    const year1=date1.getFullYear()
    const year2=date2.getFullYear()

    const month1=date1.getMonth()
    const month2=date2.getMonth()

    const diff=((year2-year1)*12)+(month2-month1)

    return with_one?diff+1:diff
}

export const countDownInHoursMinutes=(date_start, date_end)=>{
    const date1=new Date(date_start)
    const date2=new Date(date_end)

    const substract_date=Math.max(0, date2-date1)
    const substract_minutes=substract_date/1000/60

    const hour=Math.floor(substract_minutes/60)
    const minute=substract_minutes%60

    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
}

export const readFile=(fileRes)=>{
    return new Promise((resolve, reject)=>{
        const reader=new FileReader()
        reader.readAsArrayBuffer(fileRes)
        reader.onload=()=>{
            resolve(reader.result)
        }
    })
}

export const DataURIToBlob=(dataURI)=>{
    const splitDataURI=dataURI.split(',')
    const byteString=splitDataURI[0].indexOf('base64')>=0?atob(splitDataURI[1]):decodeURI(splitDataURI[1])
    const mimeString=splitDataURI[0].split(':')[1].split(';')[0]

    const ia=new Uint8Array(byteString.length)
    for(let i=0; i<byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], {type: mimeString})
}

export const formatDateTimeMinute=(date)=>{
    return format(new Date(date), "yyyy")+"-"+format(new Date(date), "MM")+"-"+format(new Date(date), "dd")+" "+format(new Date(date), "HH")+":"+format(new Date(date), "mm")+":00"
}


export const angkaKeKata=(angka)=>{
  if (angka < 0) {
    return "minus " + angkaKeKata(Math.abs(angka));
  }

  const strAngka = angka.toString().split('.');
  let bulat = parseInt(strAngka[0], 10);
  const desimal = strAngka[1];

  if (isNaN(bulat)) return "";
  if (bulat === 0) return "nol";

  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
  
  function baca(n) {
    if (n === 0) return "";
    if (n < 12) return satuan[n];
    if (n < 20) return baca(n - 10) + " belas";
    if (n < 100) return baca(Math.floor(n / 10)) + " puluh " + baca(n % 10);
    if (n < 200) return "seratus " + baca(n - 100);
    if (n < 1000) return baca(Math.floor(n / 100)) + " ratus " + baca(n % 100);
    if (n < 2000) return "seribu " + baca(n - 1000);
    if (n < 1000000) return baca(Math.floor(n / 1000)) + " ribu " + baca(n % 1000);
    if (n < 1000000000) return baca(Math.floor(n / 1000000)) + " juta " + baca(n % 1000000);
    if (n < 1000000000000) return baca(Math.floor(n / 1000000000)) + " milyar " + baca(n % 1000000000);
    if (n < 1000000000000000) return baca(Math.floor(n / 1000000000000)) + " triliun " + baca(n % 1000000000000);
    return "";
  }

  let hasil = baca(bulat).trim().replace(/\s+/g, " ");

  if (desimal) {
    const teksDesimal = desimal
      .split("")
      .map(d => (d === "0" ? "nol" : satuan[parseInt(d, 10)]))
      .join(" ");
    hasil += " koma " + teksDesimal;
  }

  return hasil;
}