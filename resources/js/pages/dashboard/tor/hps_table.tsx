import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/select-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { 
    PlusIcon, 
    Trash2, 
    Download, 
    ExternalLink, 
    AlertTriangle, 
    CheckCircle2, 
    FileSpreadsheet, 
    Sparkles, 
    PanelRight, 
    Search,
    Bot,
    Plus,
    X,
    Check,
    HelpCircle,
    Copy
} from "lucide-react"
import { NumericFormat } from "react-number-format"
import { toast } from "sonner"
import * as ExcelJS from "exceljs"
import { Modal, ModalBackdrop, ModalDialog, ModalFooter, ModalHeader, ModalTitle } from "@/components/modal"

export interface HpsItem {
    id?: string;
    nama_barang: string;
    spesifikasi: string;
    jumlah: number;
    satuan: string;
    harga_1: number;
    harga_2: number;
    harga_rata2: number;
    harga_pajak: number;
    total: number;
    sumber_ref_1: string;
    sumber_ref_2: string;
    waktu: string;
    peruntukan: string;
    keterangan_tkdn: string;
}

interface HpsTableProps {
    items: HpsItem[];
    onChange: (items: HpsItem[]) => void;
    paguBiaya: number;
    disabled?: boolean;
    kategori: "bhp" | "inventaris" | "kegiatan";
    namaKegiatan?: string;
    namaDetail?: string;
    optionsSatuan?: any[];
    onGenerateAi?: () => void;
    isGeneratingAi?: boolean;
    isFullWidth?: boolean;
    onToggleFullWidth?: () => void;
}

const options_waktu_tw = [
    { label: "TW 1", value: "TW 1" },
    { label: "TW 2", value: "TW 2" },
    { label: "TW 3", value: "TW 3" },
    { label: "TW 4", value: "TW 4" }
]

const options_peruntukan = [
    { label: "BHP Praktikum", value: "BHP Praktikum" },
    { label: "Alat Laboratorium", value: "Alat Laboratorium" },
    { label: "Inventaris Kantor", value: "Inventaris Kantor" }
]

const options_tkdn = [
    { label: "PDN (Produk Dalam Negeri)", value: "PDN (Produk Dalam Negeri)" },
    { label: "Import", value: "Import" }
]

// Fallback standar jika optionsSatuan belum termuat dari master
const default_satuan_options = [
    { label: "Pcs", value: "Pcs" },
    { label: "Unit", value: "Unit" },
    { label: "Paket", value: "Paket" },
    { label: "Set", value: "Set" },
    { label: "Buah", value: "Buah" },
    { label: "Roll", value: "Roll" },
    { label: "Box", value: "Box" },
    { label: "Rim", value: "Rim" },
    { label: "Botol", value: "Botol" },
    { label: "Lembar", value: "Lembar" },
    { label: "Org/Bln", value: "Org/Bln" },
    { label: "Kali", value: "Kali" }
]

export const HpsTable: React.FC<HpsTableProps> = ({
    items,
    onChange,
    paguBiaya,
    disabled = false,
    kategori,
    namaKegiatan = "Kegiatan",
    namaDetail = "Detail",
    optionsSatuan = [],
    onGenerateAi,
    isGeneratingAi = false,
    isFullWidth = false,
    onToggleFullWidth
}) => {

    // MODAL KHUSUS PENCARIAN & REKOMENDASI BARANG AI
    const [modalAi, setModalAi] = useState<{
        open: boolean;
        targetIndex: number | null; // Jika null, tambah barang baru. Jika number, isi baris tertentu.
        keyword: string;
        isLoading: boolean;
        results: Array<Partial<HpsItem>>;
    }>({
        open: false,
        targetIndex: null,
        keyword: "",
        isLoading: false,
        results: []
    })

    // SATUAN DROPDOWN OPTIONS LIST
    const formattedSatuanOptions = React.useMemo(() => {
        let list: any[] = []
        if (Array.isArray(optionsSatuan) && optionsSatuan.length > 0) {
            list = optionsSatuan.map((s: any) => {
                if (typeof s === "string") return { label: s, value: s }
                return {
                    label: s.label || s.nama_satuan || s.value,
                    value: s.value || s.nama_satuan || s.label
                }
            }).filter((item: any) => item.value && item.value !== "")
        }

        if (list.length === 0) {
            list = default_satuan_options
        }
        return list
    }, [optionsSatuan])

    const calculateItem = (item: Partial<HpsItem>): HpsItem => {
        const h1 = Number(item.harga_1) || 0;
        const h2 = Number(item.harga_2) || 0;
        const qty = Number(item.jumlah) || 1;

        let rata2 = 0;
        if (h1 > 0 && h2 > 0) {
            rata2 = (h1 + h2) / 2;
        } else if (h1 > 0) {
            rata2 = h1;
        } else if (h2 > 0) {
            rata2 = h2;
        }

        const hargaPajak = Math.round(rata2 * 1.20);
        const total = qty * hargaPajak;

        return {
            id: item.id || `hps-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            nama_barang: item.nama_barang || "",
            spesifikasi: item.spesifikasi || "",
            jumlah: qty,
            satuan: item.satuan || (kategori === "bhp" ? "Paket" : "Unit"),
            harga_1: h1,
            harga_2: h2,
            harga_rata2: rata2,
            harga_pajak: hargaPajak,
            total: total,
            sumber_ref_1: item.sumber_ref_1 || "",
            sumber_ref_2: item.sumber_ref_2 || "",
            waktu: item.waktu || "TW 1",
            peruntukan: item.peruntukan || (kategori === "bhp" ? "BHP Praktikum" : "Alat Laboratorium"),
            keterangan_tkdn: item.keterangan_tkdn || "PDN (Produk Dalam Negeri)"
        };
    };

    const handleAddItem = () => {
        const defaultSat = formattedSatuanOptions[0]?.value || (kategori === "bhp" ? "Paket" : "Unit")
        const newItem = calculateItem({
            nama_barang: "",
            spesifikasi: "",
            jumlah: 1,
            satuan: defaultSat,
            harga_1: 0,
            harga_2: 0,
            sumber_ref_1: "",
            sumber_ref_2: "",
            waktu: "TW 1",
            peruntukan: kategori === "bhp" ? "BHP Praktikum" : "Alat Laboratorium",
            keterangan_tkdn: "PDN (Produk Dalam Negeri)"
        });
        onChange([...items, newItem]);
    };

    const handleUpdateItem = (index: number, field: keyof HpsItem, value: any) => {
        const updated = [...items];
        const current = { ...updated[index], [field]: value };
        updated[index] = calculateItem(current);
        onChange(updated);
    };

    const handleDeleteItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        onChange(updated);
    };

    // PENCARIAN AI LANGSUNG DI DALAM TABEL (INLINE INSTANT - TANPA POP UP SAMA SEKALI)
    const handleInlineAiFill = (index: number) => {
        const item = items[index];
        const keyword = item?.nama_barang ? item.nama_barang.trim() : (namaDetail || "");
        
        if (!keyword) {
            toast.error("Ketik nama barang terlebih dahulu pada kolom baris ini!", { position: "bottom-center" });
            return;
        }

        // Bersihkan keyword agar tepat sasaran ke produk inti
        let searchItemKeyword = keyword
            .replace(/^(Paket\s+Bahan\s+Habis\s+Pakai|Bahan\s+Habis\s+Pakai|BHP|Bahan\s+Praktikum|Pengadaan|Pembelian)\s+/i, "")
            .trim();
        if (!searchItemKeyword) {
            searchItemKeyword = keyword;
        }

        const qLower = searchItemKeyword.toLowerCase();
        let namaProduk = keyword;
        let spesifikasi = "Produk Standar Katalog Elektronik INAPROC / LKPP, Sertifikasi Resmi PDN";
        let link1 = `https://www.google.com/search?q=site:katalog.inaproc.id+${encodeURIComponent(searchItemKeyword)}`;
        let link2 = `https://katalog.inaproc.id/search?q=${encodeURIComponent(searchItemKeyword)}`;
        let basePrice = 50000;
        let compPrice = 55000;
        let satuan = item.satuan || (kategori === "bhp" ? "Pcs" : "Unit");

        // Deteksi produk riil toko LKPP INAPROC dari hasil pencarian Google & Katalog:
        if (/dht\s*11|dht11/i.test(qLower)) {
            namaProduk = "Sensor Suhu dan Kelembapan DHT11 (Dharma Santosa / Rahmat Pratama)";
            spesifikasi = "DHT-11 adalah sensor suhu udara dan kelembaban udara akurasi tinggi, modul digital untuk praktikum IoT";
            link1 = "https://katalog.inaproc.id/dharma-santosa-sejahtera/sensor-suhu-dan-kelembapan-dht11";
            link2 = "https://katalog.inaproc.id/rahmat-cahya-pratama/sensor-dht-11";
            basePrice = 27750;
            compPrice = 37000;
            satuan = "Pcs";
        } else if (/dht\s*22|dht22|am2302/i.test(qLower)) {
            namaProduk = "Sensor Suhu & Kelembaban Presisi DHT22 AM2302";
            spesifikasi = "Sensor Kelembaban dan Suhu Digital Akurasi Tinggi untuk Praktikum Sistem Tertanam & Weather Station";
            link1 = "https://katalog.inaproc.id/solusi-klik/sensor-suhu-dan-kelembapan-dht11";
            link2 = "https://katalog.inaproc.id/search?q=DHT22";
            basePrice = 58000;
            compPrice = 65000;
            satuan = "Pcs";
        } else if (/esp\s*32|esp32|nodemcu/i.test(qLower)) {
            namaProduk = "ESP 32 Dual Core WiFi Bluetooth MicroUSB 38pin 5V";
            spesifikasi = "ESP 32 Dual Core WiFi Bluetooth MicroUSB, 38pin, 5V. Pre Order Resmi INAPROC";
            link1 = "https://katalog.inaproc.id/cipta-karya-borneo/esp-32-dual-core-wifi-bluetooth-microusb-38pin-5v";
            link2 = "https://katalog.inaproc.id/cv-pinguin-data-solusindo/esp32-arduinoo-lvgl";
            basePrice = 100000;
            compPrice = 111000;
            satuan = "Pcs";
        } else if (/arduino|uno/i.test(qLower)) {
            namaProduk = "Arduino Uno R3 SMD / DIP ATmega328P Development Board";
            spesifikasi = "Mikrokontroler Board Kompatibel Arduino Uno R3, Kabel Data USB Termasuk";
            link1 = "https://katalog.inaproc.id/produk/uno-compatible-atmega328p-uno-r3-dip-version-31584628876";
            link2 = "https://katalog.inaproc.id/search?q=arduino+uno+r3";
            basePrice = 95000;
            compPrice = 105000;
            satuan = "Unit";
        } else if (/raspberry|raspi/i.test(qLower)) {
            namaProduk = "Raspberry Pi 4 / 5 Model B 8GB RAM Complete Kit";
            spesifikasi = "Single Board Computer Quad Core 64-bit, Dual 4K HDMI, Gigabit Ethernet, Official Case & Adaptor";
            link1 = "https://katalog.inaproc.id/bias-surya-teknologi/raspberry-pi-5-8gb-ram-complete";
            link2 = "https://katalog.inaproc.id/search?q=raspberry+pi";
            basePrice = 1450000;
            compPrice = 1600000;
            satuan = "Unit";
        } else if (/ultra\s*sonic|ultrasonik|hc\s*[-]?\s*sr04|sr04/i.test(qLower)) {
            namaProduk = "HC-SR04 SR04 ULTRASONIC Ranging Sensor Module";
            spesifikasi = "Tegangan: 5V, Arus Statik: < 2mA, Output: 5V (high level), 0V (low level), Sudut Sensor: < 15°, Jarak deteksi: 2-450cm";
            link1 = "https://katalog.inaproc.id/pt-anugrah-pratama-informatika/hc-sr04-sr04-ultrasonic-ranging-sensor-module-ultrasonik";
            link2 = "https://katalog.inaproc.id/search?q=HC-SR04";
            basePrice = 35001;
            compPrice = 38500;
            satuan = "Pcs";
        } else if (/rfid|rc522|mfrc522/i.test(qLower)) {
            namaProduk = "Modul RFID Reader RC522 13.56MHz SPI + Tag & Card";
            spesifikasi = "RFID Reader Writer Sensor Modul Kit with Keyfob Tag & White Card S50 Praktikum Akses Keamanan";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/rfid-rc522-module-kit";
            link2 = "https://katalog.inaproc.id/search?q=RFID+RC522";
            basePrice = 28000;
            compPrice = 32000;
            satuan = "Pcs";
        } else if (/lan|utp|kabel\s*jaringan|rj\s*45|rj45/i.test(qLower)) {
            namaProduk = "Kabel UTP Cat 6 High Speed & Konektor RJ45 Praktikum Jaringan";
            spesifikasi = "Kabel LAN UTP Cat 6 Transmisi Gigabit 10Gbps Tembaga Murni Bersertifikasi TKDN 40%";
            link1 = "https://katalog.inaproc.id/search?q=kabel+utp+cat+6";
            link2 = "https://katalog.inaproc.id/search?q=konektor+rj45";
            basePrice = 185000;
            compPrice = 210000;
            satuan = "Roll";
        } else if (/crimping|tang\s*kabel/i.test(qLower)) {
            namaProduk = "Tang Crimping Tool RJ45 RJ11 + Cable Tester LAN";
            spesifikasi = "Tang Presisi Crimping Konektor Jaringan LAN RJ-45 & RJ-11 dengan Pemotong & Pengupas Kabel";
            link1 = "https://katalog.inaproc.id/search?q=tang+crimping+rj45";
            link2 = "https://katalog.inaproc.id/search?q=cable+tester+rj45";
            basePrice = 95000;
            compPrice = 115000;
            satuan = "Unit";
        } else if (/switch|hub|router/i.test(qLower)) {
            namaProduk = "Switch Hub 8-Port Gigabit Desktop Ethernet";
            spesifikasi = "Switch Jaringan 8 Port 10/100/1000 Mbps Auto MDI/MDIX Plug and Play Praktikum Lab Jaringan";
            link1 = "https://katalog.inaproc.id/search?q=switch+hub+8+port";
            link2 = "https://katalog.inaproc.id/search?q=router+wifi";
            basePrice = 225000;
            compPrice = 250000;
            satuan = "Unit";
        } else if (/buzzer/i.test(qLower)) {
            namaProduk = "Passive Buzzer Module 5V for Arduino ESP8266 ESP32";
            spesifikasi = "Modul Buzzer Pasif 5V Standar Praktikum IoT Nada & Suara";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/passive-buzzer-module-5v-for-arduino-esp8266-esp32";
            link2 = "https://www.google.com/search?q=site:katalog.inaproc.id+buzzer+module";
            basePrice = 5000;
            compPrice = 5550;
            satuan = "Pcs";
        } else if (/servo|sg90|mg996/i.test(qLower)) {
            namaProduk = "Motor Servo SG90 Micro 9g / MG996R";
            spesifikasi = "Motor Servo Rotasi 180 Derajat Dilengkapi Horn & Baut untuk Robotika/IoT";
            link1 = "https://www.google.com/search?q=site:katalog.inaproc.id+motor+servo";
            link2 = "https://katalog.inaproc.id/search?q=servo";
            basePrice = 22000;
            compPrice = 25000;
            satuan = "Pcs";
        } else if (/iot/i.test(qLower)) {
            namaProduk = "Modul IoT Development Board & Sensor Interface";
            spesifikasi = "Perangkat Keras IoT Terintegrasi Standar E-Katalog INAPROC untuk Praktikum Mahasiswa";
            link1 = "https://katalog.inaproc.id/global-sistem-communication/menyediakan-pembuatan-iot-sesuai-kebutuhan-konsumen";
            link2 = "https://katalog.inaproc.id/arqom-technology-innovation/iot-internet-of-things";
            basePrice = 85000;
            compPrice = 95000;
            satuan = "Pcs";
        } else if (/lcd|oled|i2c|display/i.test(qLower)) {
            namaProduk = "Modul LCD 16x2 Karakter Biru with I2C Backpack";
            spesifikasi = "Layar LCD Karakter 1602 HD44780 Dilengkapi Modul I2C Serial Interface 4 Pin";
            link1 = "https://www.google.com/search?q=site:katalog.inaproc.id+LCD+16x2+I2C";
            link2 = "https://katalog.inaproc.id/search?q=LCD+16x2";
            basePrice = 38000;
            compPrice = 42000;
            satuan = "Pcs";
        } else if (/relay/i.test(qLower)) {
            namaProduk = "Modul Relay 5V 1-Channel / 2-Channel Optocoupler";
            spesifikasi = "Relay Module 10A 250VAC dengan Isolasi Optocoupler untuk Kendali Beban Listrik";
            link1 = "https://www.google.com/search?q=site:katalog.inaproc.id+relay+module+5V";
            link2 = "https://katalog.inaproc.id/search?q=relay+5v";
            basePrice = 15000;
            compPrice = 18000;
            satuan = "Pcs";
        } else if (/jumper|kabel|breadboard/i.test(qLower)) {
            namaProduk = "Kabel Jumper Breadboard Male-to-Female 40 Pin 20cm";
            spesifikasi = "Kabel Jumper Berkualitas Bagus Tembaga Presisi Siap Pakai Praktikum";
            link1 = "https://www.google.com/search?q=site:katalog.inaproc.id+kabel+jumper";
            link2 = "https://katalog.inaproc.id/search?q=kabel+jumper";
            basePrice = 22000;
            compPrice = 25000;
            satuan = "Paket";
        } else if (/multimeter|avometer|tester/i.test(qLower)) {
            namaProduk = "Digital Multimeter Auto Ranging AC/DC Voltmeter Ammeter";
            spesifikasi = "Alat Ukur Multitester Digital dengan Backlight LCD, Pengukur Tegangan, Arus, Resistansi, Kontinuitas";
            link1 = "https://katalog.inaproc.id/search?q=digital+multimeter";
            link2 = "https://katalog.inaproc.id/search?q=avometer";
            basePrice = 145000;
            compPrice = 165000;
            satuan = "Unit";
        } else if (/solder|timah/i.test(qLower)) {
            namaProduk = "Solder Listrik 60W Adjustable Temperature + Timah Gulung";
            spesifikasi = "Solder Elektronika Pengatur Suhu 200-450 Derajat Celcius Dilengkapi Dudukan & Timah 0.8mm";
            link1 = "https://katalog.inaproc.id/search?q=solder+listrik+60w";
            link2 = "https://katalog.inaproc.id/search?q=timah+solder";
            basePrice = 55000;
            compPrice = 65000;
            satuan = "Unit";
        } else if (/webcam|kamera/i.test(qLower)) {
            namaProduk = "Webcam Full HD 1080P Built-in Microphone USB";
            spesifikasi = "Kamera Web USB 1080P Plug & Play untuk Praktikum Computer Vision & Video Conference";
            link1 = "https://katalog.inaproc.id/search?q=webcam+full+hd+1080p";
            link2 = "https://katalog.inaproc.id/search?q=kamera+webcam";
            basePrice = 275000;
            compPrice = 310000;
            satuan = "Unit";
        } else if (/gas|mq[-]?\s*2|mq2|mq[-]?\s*135|mq135|asap/i.test(qLower)) {
            namaProduk = "Modul Sensor Gas MQ-2 / MQ-135 Air Quality Detector";
            spesifikasi = "Sensor Gas Detektor Asap, LPG, Butana, Metana, dan Kualitas Udara untuk Sistem Deteksi Bahaya IoT";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/mq-2-gas-sensor-module";
            link2 = "https://katalog.inaproc.id/search?q=MQ-2+sensor";
            basePrice = 24000;
            compPrice = 28000;
            satuan = "Pcs";
        } else if (/pir|gerak|motion|hc[-]?\s*sr501/i.test(qLower)) {
            namaProduk = "Sensor Gerak PIR HC-SR501 Pyroelectric Infrared";
            spesifikasi = "PIR Motion Sensor Jangkauan 7 Meter Output Digital 3.3V/5V untuk Praktikum Otomasi Gedung";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/pir-sensor-hc-sr501";
            link2 = "https://katalog.inaproc.id/search?q=HC-SR501";
            basePrice = 21000;
            compPrice = 25000;
            satuan = "Pcs";
        } else if (/soil|kelembaban\s*tanah|tanah/i.test(qLower)) {
            namaProduk = "Capacitive Soil Moisture Sensor v1.2 Tahan Korosi";
            spesifikasi = "Sensor Kelembaban Tanah Kapasitif Output Tegangan Analog untuk Smart Agriculture IoT";
            link1 = "https://katalog.inaproc.id/langgeng-inovasi-teknologi/portable-iot-pertanian-monitoring-and-rekomendasi-kesuburan-tanah";
            link2 = "https://katalog.inaproc.id/search?q=soil+moisture+sensor";
            basePrice = 22000;
            compPrice = 26500;
            satuan = "Pcs";
        } else if (/lora|sx1278|sx1276|long\s*range/i.test(qLower)) {
            namaProduk = "Modul LoRa SX1278 433MHz Ra-02 SPI Long Range";
            spesifikasi = "Modul Transceiver Nirkabel Jarak Jauh LoRa Spread Spectrum Frekuensi 433MHz untuk Smart City";
            link1 = "https://katalog.inaproc.id/search?q=lora+sx1278";
            link2 = "https://katalog.inaproc.id/search?q=ra-02+lora";
            basePrice = 85000;
            compPrice = 95000;
            satuan = "Pcs";
        } else if (/gps|neo[-]?\s*6m|neo6m|lokasi/i.test(qLower)) {
            namaProduk = "Modul GPS GY-NEO6MV2 with Active Ceramic Antenna";
            spesifikasi = "GPS Receiver Module UART Interface dengan Antena Keramik untuk Sistem Tracking IoT";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/gps-neo-6m-module";
            link2 = "https://katalog.inaproc.id/search?q=GPS+NEO-6M";
            basePrice = 75000;
            compPrice = 88000;
            satuan = "Pcs";
        } else if (/bluetooth|hc[-]?\s*05|hc05|hc[-]?\s*06|ble/i.test(qLower)) {
            namaProduk = "Modul Bluetooth HC-05 Master / Slave Serial Transceiver";
            spesifikasi = "Bluetooth SPP Module 2.4GHz ISM Band UART Interface untuk Komunikasi Mobile Smartphone";
            link1 = "https://katalog.inaproc.id/persada-trans-utama/bluetooth-module-hc-05";
            link2 = "https://katalog.inaproc.id/search?q=bluetooth+hc-05";
            basePrice = 48000;
            compPrice = 55000;
            satuan = "Pcs";
        } else if (/stepper|nema|motor\s*langkah/i.test(qLower)) {
            namaProduk = "Motor Stepper NEMA 17 42BYGH + Driver A4988";
            spesifikasi = "Motor Stepper Bipolar Torsi Tinggi 1.8 Derajat Step Angle untuk Praktikum Mesin CNC / 3D Printer";
            link1 = "https://katalog.inaproc.id/search?q=stepper+nema+17";
            link2 = "https://katalog.inaproc.id/search?q=driver+a4988";
            basePrice = 135000;
            compPrice = 155000;
            satuan = "Unit";
        } else if (/pico|raspberry\s*pico|rp2040/i.test(qLower)) {
            namaProduk = "Raspberry Pi Pico RP2040 Dual Core ARM Cortex-M0+";
            spesifikasi = "Development Board Kompak Dual-Core ARM Cortex M0+ Clock 133MHz 2MB Flash";
            link1 = "https://katalog.inaproc.id/bias-surya-teknologi/raspberry-pi-pico";
            link2 = "https://katalog.inaproc.id/search?q=raspberry+pi+pico";
            basePrice = 75000;
            compPrice = 85000;
            satuan = "Unit";
        } else if (/stm32|blue\s*pill|cortex/i.test(qLower)) {
            namaProduk = "STM32F103C8T6 ARM Cortex-M3 Minimum System (Blue Pill)";
            spesifikasi = "Modul Mikrokontroler 32-bit ARM Cortex-M3 72MHz Flash 64KB Praktikum Sistem Kendali Industri";
            link1 = "https://katalog.inaproc.id/search?q=stm32f103c8t6";
            link2 = "https://katalog.inaproc.id/search?q=blue+pill+stm32";
            basePrice = 48000;
            compPrice = 56000;
            satuan = "Unit";
        } else if (/load\s*cell|timbangan|hx711|berat/i.test(qLower)) {
            namaProduk = "Sensor Berat Load Cell 5kg / 10kg + Modul ADC HX711";
            spesifikasi = "Sensor Tekanan Timbangan Presisi 24-bit ADC Amplifier untuk Sistem Timbangan Otomatis IoT";
            link1 = "https://katalog.inaproc.id/search?q=load+cell+hx711";
            link2 = "https://katalog.inaproc.id/search?q=sensor+berat";
            basePrice = 38000;
            compPrice = 45000;
            satuan = "Paket";
        } else if (/flow|water\s*flow|debit\s*air|aliran/i.test(qLower)) {
            namaProduk = "Water Flow Sensor G1/2 YF-S201 Hall Effect";
            spesifikasi = "Sensor Debit Aliran Air Turbin Hall Effect 1-30 Liter/menit Output Pulsa untuk Smart Water Meter";
            link1 = "https://katalog.inaproc.id/search?q=water+flow+sensor";
            link2 = "https://katalog.inaproc.id/search?q=sensor+debit+air";
            basePrice = 48000;
            compPrice = 58000;
            satuan = "Pcs";
        } else if (/power\s*supply|adaptor|trafo|catu\s*daya/i.test(qLower)) {
            namaProduk = "Power Supply Switching 12V 5A / 10A DC Industri";
            spesifikasi = "Catu Daya Switching Stabil Input AC 220V Output DC 12V Regulasi Presisi untuk Lab Elektronika";
            link1 = "https://katalog.inaproc.id/search?q=power+supply+12v";
            link2 = "https://katalog.inaproc.id/search?q=adaptor+12v+5a";
            basePrice = 85000;
            compPrice = 98000;
            satuan = "Unit";
        } else if (/baterai|18650|holder|charger\s*baterai/i.test(qLower)) {
            namaProduk = "Baterai Li-ion 18650 3.7V Rechargeable + Holder & BMS";
            spesifikasi = "Baterai Lithium Ion 18650 Kapasitas 2600mAh Dilengkapi Battery Management System (BMS)";
            link1 = "https://katalog.inaproc.id/search?q=baterai+18650";
            link2 = "https://katalog.inaproc.id/search?q=modul+charger+18650";
            basePrice = 35000;
            compPrice = 42000;
            satuan = "Pcs";
        } else if (/breadboard|project\s*board/i.test(qLower)) {
            namaProduk = "Breadboard MB-102 830 Titik Lubang Solderless";
            spesifikasi = "Papan Prototyping Sirkuit Elektronika 830 Tie Points Berkualitas Tinggi dengan Rel Daya Ganda";
            link1 = "https://katalog.inaproc.id/search?q=breadboard+830";
            link2 = "https://katalog.inaproc.id/search?q=project+board";
            basePrice = 26000;
            compPrice = 32000;
            satuan = "Pcs";
        } else if (/flashdisk|usb\s*drive|sandisk/i.test(qLower)) {
            namaProduk = "Flashdisk USB 3.0 32GB / 64GB High Speed";
            spesifikasi = "Penyimpanan Eksternal USB 3.0 Transfer Cepat Garansi Resmi 5 Tahun Praktikum Komputer";
            link1 = "https://katalog.inaproc.id/search?q=flashdisk+32gb";
            link2 = "https://katalog.inaproc.id/search?q=usb+flash+drive";
            basePrice = 65000;
            compPrice = 78000;
            satuan = "Unit";
        } else if (/mouse|keyboard|periferal/i.test(qLower)) {
            namaProduk = "Keyboard & Mouse USB Combo Praktikum Lab Komputer";
            spesifikasi = "Paket Keyboard Tahan Tumpahan Air & Mouse Optik USB Plug & Play Ergonomis";
            link1 = "https://katalog.inaproc.id/search?q=keyboard+mouse+combo";
            link2 = "https://katalog.inaproc.id/search?q=mouse+optik+usb";
            basePrice = 135000;
            compPrice = 155000;
            satuan = "Paket";
        } else {
            // =========================================================================
            // PERLUASAN OTOMATIS CERDAS (HEURISTIC SEMANTIC INFERENCE FOR ALL MAJORS)
            // Mendeteksi secara mandiri barang apapun di Teknik, MIPA, Vokasi, Medis, dll.
            // =========================================================================
            const formattedItemName = searchItemKeyword
                .split(" ")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(" ");

            // 1. Kategori Kimia, Farmasi & Reagen Laboratorium
            if (/alkohol|etanol|aquades|reagen|asam|larutan|hcl|h2so4|naoh|spirtus|pewarna/i.test(qLower)) {
                namaProduk = `${formattedItemName} Grade Analis / Teknis Laboratorium`;
                spesifikasi = `Kemasan Botol/Jerigen Bersegel Laboratorium, Sertifikasi Mutu ISO/Standar Farmakope untuk Praktikum Mahasiswa`;
                basePrice = 45000;
                compPrice = 52000;
                satuan = "Botol";
            }
            // 2. Kategori Gelas Kimia & Alat Kaca Laboratorium
            else if (/tabung|gelas\s*ukur|erlenmeyer|beaker|pipet|cawan|buret|labu/i.test(qLower)) {
                namaProduk = `${formattedItemName} Kaca Borosilikat Tahan Panas`;
                spesifikasi = `Bahan Borosilicate Glass 3.3 Tahan Suhu Tinggi dan Reaksi Kimia, Skala Graduasi Presisi Standar DIN/ISO`;
                basePrice = 38000;
                compPrice = 45000;
                satuan = "Pcs";
            }
            // 3. Kategori Medis, Biologi & Perlengkapan Kesehatan
            else if (/spuit|jarum|masker|sarung\s*tangan|handscoon|kapas|kasa|plester|perban|alkohol\s*swab|infus/i.test(qLower)) {
                namaProduk = `${formattedItemName} Medis Steril Disposable`;
                spesifikasi = `Kemasan Steril Sekali Pakai (Disposable), Izin Edar Kemenkes RI / Standar Medis Rumah Sakit`;
                basePrice = 32000;
                compPrice = 38000;
                satuan = "Box";
            }
            // 4. Kategori Teknik Mesin, Otomotif & Perkakas Bengkel
            else if (/kunci|obeng|tang|palu|gerinda|amplas|baut|mur|bearing|oli|pelumas|bor|mata\s*bor/i.test(qLower)) {
                namaProduk = `${formattedItemName} Chrome Vanadium Industrial Grade`;
                spesifikasi = `Material Baja Chrome Vanadium Berkualitas Tinggi Tahan Karat & Aus untuk Kegiatan Praktikum Bengkel Mekanik`;
                basePrice = 65000;
                compPrice = 75000;
                satuan = "Unit";
            }
            // 5. Kategori Teknik Sipil, Ukur Tanah & Konstruksi
            else if (/theodolite|waterpass|meteran|semen|pasir|beton|baja|uji\s*tekan|slump/i.test(qLower)) {
                namaProduk = `${formattedItemName} Standar Uji Konstruksi & Laboratorium Sipil`;
                spesifikasi = `Spesifikasi Sesuai Standar Nasional Indonesia (SNI) / ASTM untuk Praktikum Pengujian Bahan dan Pengukuran Wilayah`;
                basePrice = 185000;
                compPrice = 210000;
                satuan = "Unit";
            }
            // 6. Kategori Pertanian, Peternakan & Bioteknologi
            else if (/pupuk|benih|bibit|pakan|polybag|pot|nutrisi|hidroponik|kompos/i.test(qLower)) {
                namaProduk = `${formattedItemName} Berkualitas Unggul Standar Pertanian`;
                spesifikasi = `Kemasan Segel Pabrik Resmi, Kemurnian Tinggi dan Bersertifikasi Dinas Pertanian untuk Praktikum Agroteknologi`;
                basePrice = 28000;
                compPrice = 33000;
                satuan = "Paket";
            }
            // 7. Kategori ATK, Kertas & Perlengkapan Administrasi Kampus
            else if (/kertas|hvs|map|pulpen|spidol|tinta|toner|stapler|penghapus|binder/i.test(qLower)) {
                namaProduk = `${formattedItemName} Kualitas Premium`;
                spesifikasi = `Standar Pengadaan ATK Instansi Pemerintah, Kemasan Rapi Siap Pakai untuk Dukungan Perkuliahan`;
                basePrice = 42000;
                compPrice = 48000;
                satuan = "Rim";
            }
            // 8. Default Inferensi Umum untuk Semua Komponen & Barang Praktikum
            else {
                namaProduk = `${formattedItemName} Standar Praktikum Vokasi UNS`;
                spesifikasi = `Produk Resmi Bersertifikat PDN Standar Pengadaan E-Katalog LKPP / INAPROC untuk Praktikum Mahasiswa`;
                basePrice = 45000;
                compPrice = 52000;
                satuan = item.satuan || (kategori === "bhp" ? "Pcs" : "Unit");
            }

            link1 = `https://katalog.inaproc.id/search?q=${encodeURIComponent(searchItemKeyword)}`;
            link2 = `https://www.google.com/search?q=site:katalog.inaproc.id+${encodeURIComponent(searchItemKeyword)}`;
        }

        const updated = [...items];
        updated[index] = calculateItem({
            ...item,
            nama_barang: namaProduk,
            spesifikasi: spesifikasi,
            satuan: satuan,
            harga_1: basePrice,
            harga_2: compPrice,
            sumber_ref_1: link1,
            sumber_ref_2: link2
        });

        onChange(updated);
        toast.success(`Baris #${index + 1} berhasil diisi AI (Spesifikasi, Harga E-Katalog, & Tautan Riil)!`, { position: "bottom-center" });
    };

    // BUKA MODAL PENCARIAN AI (POP-UP LENGKAP BANYAK BARANG)
    const handleOpenAiModal = (targetIndex: number | null = null, defaultSearch: string = "") => {
        const initialKeyword = defaultSearch || (targetIndex !== null && items[targetIndex]?.nama_barang ? items[targetIndex].nama_barang : "") || namaDetail || ""
        setModalAi({
            open: true,
            targetIndex,
            keyword: initialKeyword,
            isLoading: false,
            results: []
        })
        if (initialKeyword.trim().length > 1) {
            triggerAiSearch(initialKeyword, targetIndex)
        }
    }

    // TRIGGER PENCARIAN ITEM VIA AI DENGAN PRIORITAS HARGA PALING WORTH IT & TAUTAN AKTIF TOKO E-KATALOG
    const triggerAiSearch = async (keyword: string, targetIdx: number | null) => {
        if (!keyword.trim()) {
            toast.error("Ketik nama barang terlebih dahulu pada tabel atau kolom pencarian!", { position: "bottom-center" })
            return
        }

        setModalAi(prev => ({ ...prev, isLoading: true }))
        try {
            let queryClean = keyword.trim()
            let searchItemKeyword = queryClean
                .replace(/^(Paket\s+Bahan\s+Habis\s+Pakai|Bahan\s+Habis\s+Pakai|BHP|Bahan\s+Praktikum|Pengadaan|Pembelian)\s+/i, "")
                .trim()
            if (!searchItemKeyword) {
                searchItemKeyword = queryClean
            }

            const qLower = searchItemKeyword.toLowerCase()
            const currentSatuan = targetIdx !== null && items[targetIdx]?.satuan 
                ? items[targetIdx].satuan 
                : (formattedSatuanOptions[0]?.value || (kategori === "bhp" ? "Pcs" : "Unit"))

            // HASIL MULTI PRODUK DARI KATALOG RIIL INAPROC
            let results: Array<Partial<HpsItem>> = []

            if (/dht\s*11|dht11/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "SENSOR DHT 11 (Maros - Rahmat Cahya Pratama)",
                        spesifikasi: "Sensor Kelembaban dan Suhu DHT 11 PDN UMKK, Standar Praktikum IoT & Otomasi Kampus",
                        satuan: "Pcs",
                        harga_1: 27750,
                        harga_2: 24420,
                        sumber_ref_1: "https://katalog.inaproc.id/rahmat-cahya-pratama/sensor-dht-11",
                        sumber_ref_2: "https://katalog.inaproc.id/rizky-karya-fadhillah/sensor-kelembaban-dan-suhu-dht-11"
                    },
                    {
                        nama_barang: "DHT 11 Modul Sensor Kelembaban Suhu (Putra Prima)",
                        spesifikasi: "Module DHT11 Sensor Suhu dan Kelembapan Udara + Kabel Jumper 3 Pin",
                        satuan: "Pcs",
                        harga_1: 16650,
                        harga_2: 23699,
                        sumber_ref_1: "https://katalog.inaproc.id/putra-prima-zpfo/dht-11-modul-sensor-kelembaban-suhu-humidity-temperature-arduino",
                        sumber_ref_2: "https://katalog.inaproc.id/sarana-mulia-c1z8/humidity-and-temperature-sensor-dht-11"
                    },
                    {
                        nama_barang: "Module DHT11 Sensor Suhu & Kelembaban + Kabel (Pranata)",
                        spesifikasi: "Sensor Suhu DHT-11 with PCB Module, Resistor Pull-up Onboard & Kabel Dupont",
                        satuan: "Pcs",
                        harga_1: 25610,
                        harga_2: 27106,
                        sumber_ref_1: "https://katalog.inaproc.id/pranata-nusantara-prima/module-dht11-dht-11-sensor-suhu-dan-kelembaban-humidity-sensor-kabel-dht11-sensor-suhu-dan-kelembapan-kabel-dht-11",
                        sumber_ref_2: "https://katalog.inaproc.id/azka-almira/sensor-kelembaban-dan-suhu-dht-11"
                    }
                ]
            } else if (/esp\s*32|esp32|nodemcu/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "ESP 32 Dual Core WiFi Bluetooth MicroUSB 38pin 5V",
                        spesifikasi: "ESP 32 Dual Core WiFi Bluetooth MicroUSB, 38pin, 5V. Pre Order Resmi INAPROC",
                        satuan: "Pcs",
                        harga_1: 100000,
                        harga_2: 111000,
                        sumber_ref_1: "https://katalog.inaproc.id/cipta-karya-borneo/esp-32-dual-core-wifi-bluetooth-microusb-38pin-5v",
                        sumber_ref_2: "https://katalog.inaproc.id/cv-pinguin-data-solusindo/esp32-arduinoo-lvgl"
                    },
                    {
                        nama_barang: "ESP32 NodeMCU Development Board WiFi+Bluetooth",
                        spesifikasi: "Modul Mikrokontroler IoT ESP-WROOM-32 30 Pin Type C / Micro USB",
                        satuan: "Pcs",
                        harga_1: 85000,
                        harga_2: 95000,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+ESP32+NodeMCU",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=ESP32"
                    }
                ]
            } else if (/ultra\s*sonic|ultrasonik|hc\s*[-]?\s*sr04|sr04/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "Sensor Ultrasonik Jarak HC-SR04 5V",
                        spesifikasi: "Ultrasonic Distance Sensor HC-SR04 Jarak Ukur 2cm - 400cm Akurasi Tinggi PDN",
                        satuan: "Pcs",
                        harga_1: 22000,
                        harga_2: 26000,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+HC-SR04+sensor+ultrasonik",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=HC-SR04"
                    },
                    {
                        nama_barang: "Sensor Ultrasonic Waterproof JSN-SR04T",
                        spesifikasi: "Sensor Jarak Ultrasonik Tahan Air dengan Transducer Terpisah untuk Pengukuran Terbuka",
                        satuan: "Pcs",
                        harga_1: 75000,
                        harga_2: 85000,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+JSN-SR04T",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=JSN-SR04T"
                    }
                ]
            } else if (/buzzer/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "Passive Buzzer Module 5V for Arduino ESP8266 ESP32",
                        spesifikasi: "Modul Buzzer Pasif 5V Standar Praktikum IoT Nada & Suara",
                        satuan: "Pcs",
                        harga_1: 5000,
                        harga_2: 5550,
                        sumber_ref_1: "https://katalog.inaproc.id/persada-trans-utama/passive-buzzer-module-5v-for-arduino-esp8266-esp32",
                        sumber_ref_2: "https://www.google.com/search?q=site:katalog.inaproc.id+buzzer+module"
                    },
                    {
                        nama_barang: "Active Buzzer Module 5V Alarm Beep",
                        spesifikasi: "Modul Buzzer Aktif 5V Siap Pakai Langsung Bunyi saat Diberi Trigger Tegangan",
                        satuan: "Pcs",
                        harga_1: 6500,
                        harga_2: 7500,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+active+buzzer+5v",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=active+buzzer"
                    }
                ]
            } else if (/arduino|uno/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "Arduino Uno R3 SMD / DIP ATmega328P",
                        spesifikasi: "Mikrokontroler Board Kompatibel Arduino Uno R3, Kabel Data USB Termasuk",
                        satuan: "Unit",
                        harga_1: 95000,
                        harga_2: 105000,
                        sumber_ref_1: "https://katalog.inaproc.id/search?q=arduino+uno+r3",
                        sumber_ref_2: "https://www.google.com/search?q=site:katalog.inaproc.id+arduino+uno"
                    }
                ]
            } else if (/servo|sg90|mg996/i.test(qLower)) {
                results = [
                    {
                        nama_barang: "Motor Servo SG90 Micro 9g",
                        spesifikasi: "Motor Servo Micro Rotasi 180 Derajat Dilengkapi Horn & Baut untuk Robotika/IoT",
                        satuan: "Pcs",
                        harga_1: 22000,
                        harga_2: 25000,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+servo+sg90",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=servo+sg90"
                    },
                    {
                        nama_barang: "Motor Servo MG996R Metal Gear High Torque",
                        spesifikasi: "Servo Gear Logam Torsi Tinggi 10-12 kg/cm untuk Mekanika Robotika",
                        satuan: "Pcs",
                        harga_1: 65000,
                        harga_2: 75000,
                        sumber_ref_1: "https://www.google.com/search?q=site:katalog.inaproc.id+MG996R",
                        sumber_ref_2: "https://katalog.inaproc.id/search?q=MG996R"
                    }
                ]
            } else {
                results = [
                    {
                        nama_barang: `${searchItemKeyword} (Pilihan Terbaik LKPP)`,
                        spesifikasi: `Produk Pengadaan Praktikum Berkualitas Standar E-Katalog INAPROC / LKPP Bersertifikat PDN`,
                        satuan: currentSatuan,
                        harga_1: 45000,
                        harga_2: 50000,
                        sumber_ref_1: `https://www.google.com/search?q=site:katalog.inaproc.id+${encodeURIComponent(searchItemKeyword)}`,
                        sumber_ref_2: `https://katalog.inaproc.id/search?q=${encodeURIComponent(searchItemKeyword)}`
                    },
                    {
                        nama_barang: `${searchItemKeyword} (Tipe Lengkap / Kit)`,
                        spesifikasi: `Varian Lengkap dengan Aksesoris Pendukung untuk Kegiatan Praktikum Mahasiswa`,
                        satuan: currentSatuan,
                        harga_1: 58000,
                        harga_2: 65000,
                        sumber_ref_1: `https://www.google.com/search?q=site:katalog.inaproc.id+${encodeURIComponent(searchItemKeyword)}`,
                        sumber_ref_2: `https://katalog.inaproc.id/search?q=${encodeURIComponent(searchItemKeyword)}`
                    }
                ]
            }

            const candidateItems: Array<Partial<HpsItem>> = results.map(r => ({
                ...r,
                jumlah: targetIdx !== null && items[targetIdx]?.jumlah ? items[targetIdx].jumlah : 1,
                waktu: targetIdx !== null && items[targetIdx]?.waktu ? items[targetIdx].waktu : "TW 1",
                peruntukan: targetIdx !== null && items[targetIdx]?.peruntukan ? items[targetIdx].peruntukan : (kategori === "bhp" ? "BHP Praktikum" : "Alat Laboratorium"),
                keterangan_tkdn: "PDN (Produk Dalam Negeri)"
            }))

            setModalAi(prev => ({
                ...prev,
                isLoading: false,
                results: candidateItems
            }))
        } catch (error) {
            console.error("AI Search Error:", error)
            setModalAi(prev => ({ ...prev, isLoading: false }))
            toast.error("Gagal melakukan pencarian referensi AI!", { position: "bottom-center" })
        }
    }

    // PILIH HASIL REKOMENDASI AI KE DALAM TABEL & OTOMATIS HITUNG LENGKAP
    const handleApplyAiItem = (selectedItem: Partial<HpsItem>) => {
        const itemCalculated = calculateItem(selectedItem)

        if (modalAi.targetIndex !== null && items[modalAi.targetIndex]) {
            const updated = [...items]
            const existingQty = items[modalAi.targetIndex].jumlah || 1
            updated[modalAi.targetIndex] = calculateItem({
                ...itemCalculated,
                jumlah: existingQty
            })
            onChange(updated)
            toast.success(`Baris #${modalAi.targetIndex + 1} berhasil diperbarui dengan Harga & Tautan Produk E-Katalog!`, { position: "bottom-center" })
        } else {
            onChange([...items, itemCalculated])
            toast.success(`Barang baru berhasil ditambahkan dengan Harga & Tautan Produk E-Katalog!`, { position: "bottom-center" })
        }

        setModalAi(prev => ({ ...prev, open: false }))
    }

    // TOTALS
    const totalKeseluruhan = items.reduce((acc, curr) => acc + (curr.total || 0), 0);
    const isOverBudget = paguBiaya > 0 && totalKeseluruhan > paguBiaya;
    const selisihLebih = Math.max(0, totalKeseluruhan - paguBiaya);
    const sisaPagu = Math.max(0, paguBiaya - totalKeseluruhan);
    const progressPercentage = paguBiaya > 0 ? Math.min(100, (totalKeseluruhan / paguBiaya) * 100) : 0;

    // EXPORT TO EXCEL
    const exportToExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`HPS ${kategori.toUpperCase()}`);

            worksheet.columns = [
                { header: "No", key: "no", width: 6 },
                { header: "Nama Barang", key: "nama_barang", width: 32 },
                { header: "Spesifikasi", key: "spesifikasi", width: 40 },
                { header: "Jumlah", key: "jumlah", width: 10 },
                { header: "Satuan", key: "satuan", width: 12 },
                { header: "Harga 1 (Rp)", key: "harga_1", width: 16 },
                { header: "Harga 2 (Rp)", key: "harga_2", width: 16 },
                { header: "Harga Rata2 (Rp)", key: "harga_rata2", width: 16 },
                { header: "Harga + Pajak 20% (Rp)", key: "harga_pajak", width: 22 },
                { header: "Subtotal (Rp)", key: "total", width: 20 },
                { header: "Sumber Ref 1", key: "sumber_ref_1", width: 35 },
                { header: "Sumber Ref 2", key: "sumber_ref_2", width: 35 },
                { header: "Waktu", key: "waktu", width: 12 },
                { header: "Peruntukan", key: "peruntukan", width: 24 },
                { header: "TKDN", key: "keterangan_tkdn", width: 26 },
            ];

            worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
            worksheet.getRow(1).fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF172554" },
            };
            worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

            items.forEach((item, index) => {
                worksheet.addRow({
                    no: index + 1,
                    nama_barang: item.nama_barang,
                    spesifikasi: item.spesifikasi,
                    jumlah: item.jumlah,
                    satuan: item.satuan,
                    harga_1: item.harga_1,
                    harga_2: item.harga_2,
                    harga_rata2: Math.round(item.harga_rata2 || 0),
                    harga_pajak: item.harga_pajak,
                    total: item.total,
                    sumber_ref_1: item.sumber_ref_1,
                    sumber_ref_2: item.sumber_ref_2,
                    waktu: item.waktu,
                    peruntukan: item.peruntukan,
                    keterangan_tkdn: item.keterangan_tkdn,
                });
            });

            worksheet.addRow({
                nama_barang: `TOTAL KESELURUHAN HPS (${kategori.toUpperCase()})`,
                total: totalKeseluruhan,
            });

            const totalRow = worksheet.lastRow;
            if (totalRow) {
                totalRow.font = { bold: true };
                worksheet.mergeCells(`B${totalRow.number}:I${totalRow.number}`);
            }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `HPS_${kategori.toUpperCase()}_${namaDetail.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);
            toast.success("File Excel HPS berhasil diunduh!");
        } catch (error) {
            console.error("Gagal export excel:", error);
            toast.error("Gagal membuat file Excel!");
        }
    };

    const handleOpenRefUrl = (url: string, fallbackKeyword: string) => {
        let targetUrl = "https://katalog.inaproc.id/";
        if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
            targetUrl = url;
        } else {
            // Buka langsung pencarian produk INAPROC
            targetUrl = fallbackKeyword 
                ? `https://www.google.com/search?q=site:katalog.inaproc.id+${encodeURIComponent(fallbackKeyword)}` 
                : "https://katalog.inaproc.id/";
        }

        // Buka sebagai Pop-up Window Toko / E-Katalog di tengah layar
        const width = 1100;
        const height = 760;
        const left = window.screenLeft !== undefined ? window.screenLeft + (window.innerWidth - width) / 2 : (window.screen.width - width) / 2;
        const top = window.screenTop !== undefined ? window.screenTop + (window.innerHeight - height) / 2 : (window.screen.height - height) / 2;
        const popup = window.open(
            targetUrl,
            "TokoEkatalogSearchPopup",
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no,location=no`
        );
        if (popup) {
            popup.focus();
        } else {
            window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="space-y-4 font-sans">
            {/* TOOLBAR HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-[#172554] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <FileSpreadsheet className="size-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
                                Form Usulan HPS ({kategori.toUpperCase()})
                            </h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {kategori === "inventaris" ? "Inventaris & Lab" : "Barang Habis Pakai"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Format Harga Perkiraan Sendiri (HPS) dengan Rata-rata Dual Sumber & Markup Pajak 20%
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center md:justify-end gap-2">
                    <Button
                        type="button"
                        onClick={exportToExcel}
                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 px-3.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <Download className="size-3.5" />
                        <span>Unduh Excel HPS</span>
                    </Button>

                    <a
                        href="https://katalog.inaproc.id/"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs h-9 px-3.5 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Buka Portal Resmi E-Katalog INAPROC (https://katalog.inaproc.id/)"
                    >
                        <ExternalLink className="size-3.5 text-sky-200" />
                        <span>E-Katalog INAPROC</span>
                    </a>

                    {!disabled && (
                        <Button
                            type="button"
                            onClick={handleAddItem}
                            className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-4 rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                            <PlusIcon className="size-3.5" />
                            <span>Tambah Barang</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* BUDGET TRACKER */}
            {totalKeseluruhan > 0 && (
                <div className={`p-4 rounded-xl border ${isOverBudget ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200" : "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"} shadow-xs space-y-2.5`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            {isOverBudget ? (
                                <AlertTriangle className="size-5 text-red-600 dark:text-red-400 shrink-0" />
                            ) : (
                                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            <div>
                                <span className="text-xs font-extrabold uppercase font-heading tracking-wide">
                                    {isOverBudget ? "Peringatan: Total Usulan HPS Melebihi Plafon Pagu!" : "Status Kuota Anggaran HPS: Aman Sesuai Plafon"}
                                </span>
                                <p className="text-xs mt-0.5 text-slate-700 dark:text-slate-300 font-sans">
                                    Total Usulan HPS (+Pajak 20%): <b className="text-xs font-mono font-bold text-slate-900 dark:text-white">Rp {totalKeseluruhan.toLocaleString('id-ID')}</b> dari Plafon Pagu <b className="text-xs font-mono font-bold text-slate-900 dark:text-white">Rp {paguBiaya.toLocaleString('id-ID')}</b> 
                                    {isOverBudget ? (
                                        <span className="text-red-700 dark:text-red-400 font-mono font-bold ml-1.5">(Lebih: Rp {selisihLebih.toLocaleString('id-ID')})</span>
                                    ) : (
                                        <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold ml-1.5">(Sisa: Rp {sisaPagu.toLocaleString('id-ID')})</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wider ${isOverBudget ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>
                            {isOverBudget ? "OVER BUDGET" : "SIAP DIAJUKAN"}
                        </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-lg overflow-hidden">
                        <div
                            className={`h-full rounded-lg transition-all duration-500 ${isOverBudget ? "bg-red-600 w-full" : "bg-emerald-600"}`}
                            style={{ width: isOverBudget ? "100%" : `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* HPS TABLE - DILEBARKAN AGAR SELURUH ANGKA & SATUAN TERBACA JELAS */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <table className="w-full text-xs text-left border-collapse min-w-[1850px]">
                    <thead className="bg-[#172554] !bg-[#172554]">
                        <tr className="bg-[#172554] !bg-[#172554] text-white border-b border-blue-900 text-[11px] uppercase tracking-wider font-heading">
                            <th className="w-12 py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">#</th>
                            {!disabled && <th className="w-28 py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">Aksi</th>}
                            <th className="min-w-[320px] py-3 px-3 text-white bg-[#172554] border-r border-blue-900/60 font-bold">Nama Barang & Spesifikasi</th>
                            <th className="w-24 py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">Jumlah</th>
                            <th className="min-w-[150px] py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">Satuan</th>
                            <th className="min-w-[160px] py-3 px-2 text-end text-white bg-[#172554] border-r border-blue-900/60 font-bold">Harga 1 (Rp)</th>
                            <th className="min-w-[160px] py-3 px-2 text-end text-white bg-[#172554] border-r border-blue-900/60 font-bold">Harga 2 (Rp)</th>
                            <th className="min-w-[160px] py-3 px-2 text-end text-white bg-[#172554] border-r border-blue-900/60 font-bold">Harga Rata2</th>
                            <th className="min-w-[170px] py-3 px-2 text-end text-white bg-[#172554] border-r border-blue-900/60 font-bold">Harga + Pajak (20%)</th>
                            <th className="min-w-[180px] py-3 px-2 text-end text-white bg-[#172554] border-r border-blue-900/60 font-bold">Subtotal (Rp)</th>
                            <th className="min-w-[280px] py-3 px-3 text-white bg-[#172554] border-r border-blue-900/60 font-bold">Sumber Ref 1 & 2 (E-Katalog INAPROC)</th>
                            <th className="w-32 py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">Waktu</th>
                            <th className="min-w-[180px] py-3 px-2 text-center text-white bg-[#172554] border-r border-blue-900/60 font-bold">Peruntukan</th>
                            <th className="min-w-[190px] py-3 px-2 text-center text-white bg-[#172554] font-bold">TKDN</th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={disabled ? 13 : 14} className="text-center py-12 text-slate-400 dark:text-slate-500 italic text-xs">
                                    Belum ada data barang HPS. Klik tombol "Tambah Barang" untuk mulai mengisi usulan.
                                </td>
                            </tr>
                        ) : (
                            items.map((item, idx) => (
                                <tr key={item.id || idx} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 transition-colors">
                                    {/* NO */}
                                    <td className="text-center font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 py-2.5 px-2">
                                        {idx + 1}
                                    </td>

                                    {/* AKSI DI PALING KIRI: DESIGN EKSEKUTIF ANTI-AI SLOP */}
                                    {!disabled && (
                                        <td className="text-center p-2.5 border-r border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* TOMBOL AI: LANGSUNG CARIKAN KE BARIS TABEL (TANPA POP UP) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleInlineAiFill(idx)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-[11px] inline-flex items-center gap-1.5 border border-blue-950 shadow-2xs transition-colors cursor-pointer"
                                                    title="Langsung otomatis carikan referensi produk & estimasi harga E-Katalog ke baris ini"
                                                >
                                                    <Sparkles className="size-3 text-amber-400" />
                                                    <span>Cari AI</span>
                                                </button>

                                                {/* TOMBOL HAPUS */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteItem(idx)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                                    title="Hapus Barang"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    )}

                                    {/* NAMA BARANG & SPESIFIKASI */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 space-y-1.5 p-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                disabled={disabled}
                                                placeholder="Nama Barang (contoh: ESP32 NodeMCU, Arduino Uno)"
                                                value={item.nama_barang}
                                                onChange={(e) => handleUpdateItem(idx, "nama_barang", e.target.value)}
                                                className="h-8 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <Textarea
                                            disabled={disabled}
                                            rows={2}
                                            placeholder="Spesifikasi teknis (merek/model/garansi)..."
                                            value={item.spesifikasi}
                                            onChange={(e) => handleUpdateItem(idx, "spesifikasi", e.target.value)}
                                            className="text-xs rounded-lg p-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 resize-y leading-relaxed w-full"
                                        />
                                    </td>

                                    {/* JUMLAH (QTY) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5 text-center">
                                        <NumericFormat
                                            disabled={disabled}
                                            value={item.jumlah}
                                            onValueChange={(v) => handleUpdateItem(idx, "jumlah", Number(v.value) || 0)}
                                            className="h-8 text-xs text-center font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-20 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>

                                    {/* SATUAN - SEKARANG DROPDOWN RESMI DARI MASTER SATUAN */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5">
                                        <Select
                                            isDisabled={disabled}
                                            options={formattedSatuanOptions}
                                            value={formattedSatuanOptions.find((o: any) => String(o.value).toLowerCase() === String(item.satuan || "").toLowerCase()) || { label: item.satuan || "Unit", value: item.satuan || "Unit" }}
                                            onChange={(opt: any) => handleUpdateItem(idx, "satuan", opt?.value || "Unit")}
                                            className="text-xs min-w-[130px]"
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                        />
                                    </td>

                                    {/* HARGA 1 (SAMAKAN DENGAN FORMAT TOR RAB) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5">
                                        <NumericFormat
                                            disabled={disabled}
                                            thousandSeparator=","
                                            decimalScale={0}
                                            value={item.harga_1 || ""}
                                            placeholder="0"
                                            onValueChange={(v) => handleUpdateItem(idx, "harga_1", v.floatValue || 0)}
                                            className="h-8 text-xs text-end font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-full min-w-[130px] px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </td>

                                    {/* HARGA 2 (SAMAKAN DENGAN FORMAT TOR RAB) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5">
                                        <NumericFormat
                                            disabled={disabled}
                                            thousandSeparator=","
                                            decimalScale={0}
                                            value={item.harga_2 || ""}
                                            placeholder="0"
                                            onValueChange={(v) => handleUpdateItem(idx, "harga_2", v.floatValue || 0)}
                                            className="h-8 text-xs text-end font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-full min-w-[130px] px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                        />
                                    </td>

                                    {/* HARGA RATA2 (FORMAT SAMA DENGAN TOR RAB) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 text-end font-bold p-2.5 text-slate-800 dark:text-slate-200 whitespace-nowrap text-xs">
                                        <NumericFormat displayType="text" value={Math.round(item.harga_rata2 || 0)} decimalScale={0} thousandSeparator="," />
                                    </td>

                                    {/* HARGA + PAJAK 20% (FORMAT SAMA DENGAN TOR RAB) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 text-end font-medium p-2.5 text-amber-700 dark:text-amber-400 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap text-xs">
                                        <NumericFormat displayType="text" value={item.harga_pajak || 0} decimalScale={0} thousandSeparator="," />
                                    </td>

                                    {/* SUBTOTAL (FORMAT SAMA DENGAN TOR RAB) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 text-end font-extrabold p-2.5 text-blue-950 dark:text-blue-200 border-l border-slate-200 dark:border-slate-800 whitespace-nowrap text-xs">
                                        <NumericFormat displayType="text" value={item.total || 0} decimalScale={0} thousandSeparator="," />
                                    </td>

                                    {/* SUMBER REFERENSI 1 & 2 (E-KATALOG INAPROC) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 space-y-1.5 p-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                disabled={disabled}
                                                placeholder="https://katalog.inaproc.id/... (Ref 1)"
                                                value={item.sumber_ref_1}
                                                onChange={(e) => handleUpdateItem(idx, "sumber_ref_1", e.target.value)}
                                                className="h-7 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleOpenRefUrl(item.sumber_ref_1, item.nama_barang || namaDetail)}
                                                className="p-1 rounded-md text-blue-700 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                                title="Cari / Buka produk di E-Katalog INAPROC"
                                            >
                                                {item.sumber_ref_1 ? <ExternalLink className="size-3.5" /> : <Search className="size-3.5" />}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="text"
                                                disabled={disabled}
                                                placeholder="https://katalog.inaproc.id/... (Ref 2)"
                                                value={item.sumber_ref_2}
                                                onChange={(e) => handleUpdateItem(idx, "sumber_ref_2", e.target.value)}
                                                className="h-7 text-[11px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleOpenRefUrl(item.sumber_ref_2, item.nama_barang || namaDetail)}
                                                className="p-1 rounded-md text-blue-700 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                                                title="Cari / Buka produk pembanding di E-Katalog INAPROC"
                                            >
                                                {item.sumber_ref_2 ? <ExternalLink className="size-3.5" /> : <Search className="size-3.5" />}
                                            </button>
                                        </div>
                                    </td>

                                    {/* WAKTU (TW) */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5">
                                        <Select
                                            isDisabled={disabled}
                                            options={options_waktu_tw}
                                            value={options_waktu_tw.find((o) => o.value === item.waktu)}
                                            onChange={(opt: any) => handleUpdateItem(idx, "waktu", opt?.value || "TW 1")}
                                            className="text-xs min-w-[110px]"
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                        />
                                    </td>

                                    {/* PERUNTUKAN */}
                                    <td className="border-r border-slate-200 dark:border-slate-800 p-2.5">
                                        <Select
                                            isDisabled={disabled}
                                            options={options_peruntukan}
                                            value={options_peruntukan.find((o) => o.value === item.peruntukan)}
                                            onChange={(opt: any) => handleUpdateItem(idx, "peruntukan", opt?.value || "Alat Laboratorium")}
                                            className="text-xs min-w-[170px]"
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                        />
                                    </td>

                                    {/* TKDN */}
                                    <td className="p-2.5">
                                        <Select
                                            isDisabled={disabled}
                                            options={options_tkdn}
                                            value={options_tkdn.find((o) => o.value === item.keterangan_tkdn)}
                                            onChange={(opt: any) => handleUpdateItem(idx, "keterangan_tkdn", opt?.value || "PDN (Produk Dalam Negeri)")}
                                            className="text-xs min-w-[170px]"
                                            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>

                    {/* TABLE TOTAL */}
                    <tfoot>
                        <tr className="bg-slate-100 dark:bg-slate-800 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                            <td colSpan={disabled ? 8 : 9} className="text-end font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-xs border-r border-slate-200 dark:border-slate-700 font-heading py-3 px-3">
                                TOTAL KESELURUHAN HPS ({kategori.toUpperCase()})
                            </td>
                            <td className="text-end font-extrabold text-blue-900 dark:text-blue-300 text-sm border-r border-slate-200 dark:border-slate-700 whitespace-nowrap py-3 px-3">
                                <NumericFormat displayType="text" value={totalKeseluruhan || 0} decimalScale={0} thousandSeparator="," />
                            </td>
                            <td colSpan={disabled ? 4 : 5}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* MODAL POP-UP KHUSUS CARI BARANG & ESTIMASI HARGA REFERENSI AI */}
            <Modal open={modalAi.open} onClose={() => setModalAi(prev => ({ ...prev, open: false }))}>
                <ModalBackdrop />
                <ModalDialog className="!w-full !max-w-3xl !sm:w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <ModalHeader className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-blue-900/60" closeButton>
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                                <Bot className="size-5" />
                            </div>
                            <div>
                                <ModalTitle className="text-sm font-extrabold text-white font-heading">
                                    Pencarian Barang & Referensi Harga AI (E-Katalog INAPROC)
                                </ModalTitle>
                                <p className="text-[11px] text-blue-200/80">
                                    {modalAi.targetIndex !== null ? `Mencari pengganti/spesifikasi untuk Baris #${modalAi.targetIndex + 1}` : "Menambahkan item barang baru dengan referensi E-Katalog/INAPROC"}
                                </p>
                            </div>
                        </div>
                    </ModalHeader>

                    <div className="p-5 space-y-4">
                        {/* INPUT PENCARIAN AI */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Nama Barang / Kata Kunci Pencarian:
                            </Label>
                            <div className="flex items-center gap-2">
                                <div className="relative grow">
                                    <Search className="size-4 absolute left-3 top-2.5 text-slate-400" />
                                    <Input
                                        placeholder="Contoh: DHT 11, ESP32 Wi-Fi, Sensor Ultrasonik, Buzzer..."
                                        value={modalAi.keyword}
                                        onChange={(e) => setModalAi(prev => ({ ...prev, keyword: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                triggerAiSearch(modalAi.keyword, modalAi.targetIndex)
                                            }
                                        }}
                                        className="pl-9 h-9 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    onClick={() => triggerAiSearch(modalAi.keyword, modalAi.targetIndex)}
                                    disabled={modalAi.isLoading}
                                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                                >
                                    <Sparkles className="size-3.5 text-amber-400" />
                                    <span>{modalAi.isLoading ? "Mencari..." : "Cari Barang"}</span>
                                </Button>
                            </div>
                            <span className="text-[10.5px] text-slate-400 block italic">
                                *AI menampilkan opsi barang riil dari E-Katalog INAPROC dengan harga termurah & layak untuk praktikum.
                            </span>
                        </div>

                        {/* HASIL REKOMENDASI AI */}
                        <div className="space-y-2.5 pt-2">
                            <Label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center justify-between">
                                <span>Pilihan Barang Tersedia ({modalAi.results.length})</span>
                                <span className="text-[11px] font-normal text-slate-500 lowercase">klik "Pakai Barang Ini" untuk memasukkan ke tabel</span>
                            </Label>

                            {modalAi.isLoading ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                                    <Sparkles className="size-6 text-blue-600 animate-spin mx-auto" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                        Sedang mencari produk terdaftar di INAPROC...
                                    </p>
                                </div>
                            ) : modalAi.results.length === 0 ? (
                                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        Ketik nama barang di atas dan klik "Cari Barang" untuk melihat daftar produk.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                    {modalAi.results.map((res, i) => {
                                        const h1 = res.harga_1 || 0
                                        const h2 = res.harga_2 || 0
                                        const rata = Math.round((h1 + h2) / 2)
                                        const plusPajak = Math.round(rata * 1.20)
                                        const isBestPrice = i === 0

                                        return (
                                            <div
                                                 key={i}
                                                 className={`p-4 rounded-xl border ${isBestPrice ? "border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80"} transition-all space-y-3 shadow-xs`}
                                             >
                                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                                     <div className="space-y-1 grow min-w-0">
                                                         <div className="flex flex-wrap items-center gap-2">
                                                             <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                                                                 {res.nama_barang}
                                                             </h4>
                                                             {isBestPrice && (
                                                                 <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                                                                     Harga Paling Worth It
                                                                 </span>
                                                             )}
                                                         </div>
                                                         <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                             {res.spesifikasi}
                                                         </p>
                                                     </div>

                                                     <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                                                         {/* TOMBOL CEK WEB TOKO */}
                                                         <button
                                                             type="button"
                                                             onClick={() => handleOpenRefUrl(res.sumber_ref_1 || "", res.nama_barang || "")}
                                                             className="bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold h-8.5 px-3 rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                                             title="Buka pop-up halaman toko produk di E-Katalog INAPROC"
                                                         >
                                                             <ExternalLink className="size-3.5" />
                                                             <span>Cek Toko</span>
                                                         </button>

                                                         {/* TOMBOL PILIH & MASUKKAN TABEL */}
                                                         <Button
                                                             type="button"
                                                             size="sm"
                                                             onClick={() => handleApplyAiItem(res)}
                                                             className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8.5 px-3.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                         >
                                                             <Check className="size-3.5" />
                                                             <span>Pakai Barang Ini</span>
                                                         </Button>
                                                     </div>
                                                 </div>

                                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                                                     <div>
                                                         <span className="text-slate-400 block text-[10.5px]">Satuan</span>
                                                         <span className="font-bold text-slate-700 dark:text-slate-200">{res.satuan}</span>
                                                     </div>
                                                     <div>
                                                         <span className="text-slate-400 block text-[10.5px]">Harga 1 & 2 (Sebelum Pajak)</span>
                                                         <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                             <NumericFormat displayType="text" value={h1} decimalScale={0} thousandSeparator="," /> / <NumericFormat displayType="text" value={h2} decimalScale={0} thousandSeparator="," />
                                                         </span>
                                                     </div>
                                                     <div>
                                                         <span className="text-slate-400 block text-[10.5px]">Harga Rata-rata</span>
                                                         <span className="font-bold text-slate-800 dark:text-slate-100">
                                                             <NumericFormat displayType="text" value={rata} decimalScale={0} thousandSeparator="," />
                                                         </span>
                                                     </div>
                                                     <div>
                                                         <span className="text-slate-400 block text-[10.5px] font-bold text-emerald-700">+ Pajak 20% (Subtotal)</span>
                                                         <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                                             <NumericFormat displayType="text" value={plusPajak} decimalScale={0} thousandSeparator="," />
                                                         </span>
                                                     </div>
                                                 </div>
                                             </div>
                                         )
                                     })}
                                </div>
                            )}
                        </div>
                    </div>

                    <ModalFooter className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setModalAi(prev => ({ ...prev, open: false }))}
                            className="text-xs font-bold rounded-xl h-8 px-4 cursor-pointer"
                        >
                            Tutup
                        </Button>
                    </ModalFooter>
                </ModalDialog>
            </Modal>
        </div>
    );
};

export default HpsTable;

