namespace intranet.common.helpers {
    export class ToastConfig {
        type: ToastType; // Message type
        title: string; // Title of the notification box
        message: string; // Message inside the box
        timeout: number; // Timeout in milliseconds. (0 = stay visible till the user clicks on the notification)
        clickHandler: EventListener; // Function executed when the user clicks on the toast notification (optional)

        constructor(type: ToastType, title: string, message: string, timeout: number = 10000) {
            this.type = type;
            this.title = title;
            this.message = message;
            this.timeout = timeout;
        }

        public getTypeDescription(): string {
            switch (this.type) {
                case ToastType.Error:
                    return 'error';
                case ToastType.Info:
                    return 'info';
                case ToastType.Success:
                    return 'success';
                case ToastType.Warning:
                    return 'warning';
            }
        }

        
    }
}