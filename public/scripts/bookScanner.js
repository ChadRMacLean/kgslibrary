import { display_new_book_confirmation } from './userInteractionUI.js';

class Detector {

    constructor() { 
        try {
            window['BarcodeDetector'].getSupportedFormats();
            this.is_mobile = true;

        } catch {
            window['BarcodeDetector'] = barcodeDetectorPolyfill.BarcodeDetectorPolyfill;
            this.is_mobile = false;
        }

        this.active = false;
        this.barcodes = new Set();
        this.request_id = undefined;
        this.awaiting_user_confirmation = false;

        this.available_formats = undefined;
        this.accepted_formats = ['isbn_10', 'isbn_13', 'isbn_13+2', 'isbn_13+5'];

        document.addEventListener("DOMContentLoaded", (event) => {
            this.init();
        });
    }

    async init() {
        this.canvas = document.querySelector("#canvas");
        this.ctx = this.canvas.getContext('2d');

        this.mobile_reader = document.querySelector("#mobile_reader");

        this.viewport_container = document.querySelector("#viewport");
        this.video_container = document.querySelector("#video");
        this.camera_button = document.querySelector("#videoBtn");
        this.barcode_image = document.querySelector("img#barcodeImage");

        this.available_formats = await this.get_formats();

        if (this.is_mobile) {
            this.detector = new Html5QrcodeScanner('mobile_reader', { fps: 10 }, false);
        } else {
            this.detector = new BarcodeDetector({ formats: this.available_formats });
        }

        this.camera_button.addEventListener('click', () => this.toggle_user_media());
    }

    async get_formats() {
        const supported_formats = await BarcodeDetector.getSupportedFormats();

        return supported_formats.filter(format => this.accepted_formats.includes(format));
    }

    async toggle_user_media() {
        if (!this.active && !this.is_mobile) {
            this.viewport_container.style.display = 'block';
            this.camera_button.textContent = "Disable Camera";

            navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'environment' } })
                .then(stream => this.video_container.srcObject = stream)
                .catch(error => console.error(error));

            this.active = true;
            this.detect_video(true);
        } else if (this.active && !this.is_mobile) {
            this.video_container.srcObject.getTracks().forEach(track => {
                if (track.readyState == 'live' && track.kind ==='video') {
                    track.stop();
                }
            });

            this.detect_video(false);

            this.active = false;
            this.video_container.srcObject = undefined;
            this.viewport_container.style.display = 'none';
        }
        
        if (!this.active && this.is_mobile) {
            this.mobile_reader.style.display = 'block';
            this.camera_button.textContent = "Disable Camera";

            this.detector.render(
                (decoded_text, decoded_result) => {
                    display_new_book_confirmation(decoded_text);
                    this.detector.pause();
                    this.detector.clear();
                }, (error) => {}
            );

            this.active = true;
        } else if(this.active && this.is_mobile) {
            this.active = false;
            this.mobile_reader.style.display = 'none';
            this.camera_button.textContent = "Enable Camera";
            this.detector.pause();
            this.detector.clear();
        }
    }

    display_detection_rect(source, symbols) {
        this.canvas.width = source.naturalWidth || source.videoWidth || source.width;
        this.canvas.height = source.naturalHeight || source.videoHeight || source.height;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        symbols.forEach(symbol => {
            const lastCornerPoint = symbol.cornerPoints[symbol.cornerPoints.length - 1];
            this.ctx.moveTo(lastCornerPoint.x, lastCornerPoint.y);
            symbol.cornerPoints.forEach(point => this.ctx.lineTo(point.x, point.y));

            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = '#00e000ff';
            this.ctx.stroke();
        });
    }

    detect_video(repeat) {
        if (repeat && this.active) {
            this.detect(this.video_container).then(() => this.request_id = requestAnimationFrame(() => this.detect_video(true)));
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            cancelAnimationFrame(this.request_id);
            this.request_id = undefined;
        }
    }

    detect(source) {
        return this.detector.detect(source).then(symbols => {
            this.display_detection_rect(source, symbols);

            if (symbols.length >= 1) {
                symbols.forEach(symbol => {
                    if (this.available_formats.includes(symbol.format) && !this.barcodes.has(symbol.rawValue)) {
                        // Store barcode temporarily.
                        // Lookup barcode data using API.
                        // Show new book data window.
                        // Confirm with user information is correct. If yes, add data to local storage/db
                        this.toggle_user_media();
                        display_new_book_confirmation(symbol.rawValue);
                    }
                });
            }          
        });
    }
}

export const detector = new Detector();