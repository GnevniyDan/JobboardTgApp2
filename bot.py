from flask import Flask, request
import requests

app = Flask(__name__)

BOT_TOKEN = '7912367412:AAELAavnry6VpA-fRtxNZQNBNVMgbxTpvW8'
WEBHOOK_URL = 'https://jobboard.up.railway.app/webhook'  # Ваш URL для обработки сообщений от бота

# Устанавливаем webhook для бота
def set_webhook():
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook'
    response = requests.post(url, json={"url": WEBHOOK_URL})
    print("Webhook set:", response.json())

# Обработка запросов от Telegram
@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()

    if 'message' in data:
        chat_id = data['message']['chat']['id']
        if 'text' in data['message']:
            if data['message']['text'] == '/start':
                send_welcome_message(chat_id)

    return "OK"

# Функция отправки сообщения с кнопкой для Mini App
def send_welcome_message(chat_id):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': 'Click the button below to access the job board',
        'reply_markup': {
            'inline_keyboard': [[{
                'text': 'Open Job Board',
                'web_app': {
                    'url': 'https://your-domain.com/jobboard_interface.html'
                }
            }]]
        }
    }
    response = requests.post(url, json=data)
    print("Message sent:", response.json())

if __name__ == '__main__':
    set_webhook()  # Устанавливаем webhook
    app.run(port=5000)
