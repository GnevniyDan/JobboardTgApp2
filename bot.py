from aiogram import Bot, Dispatcher, types
from aiogram.utils import executor

API_TOKEN = '7345731768:AAG3o5Ay_i5etdxoMq6cWNgOdTWBqsIAZEQ'
WEB_APP_URL = 'https://bca2-5-252-22-74.ngrok-free.app /Jobboard_interface.html'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start', 'open_web_app'])
async def send_web_app(message: types.Message):
    keyboard = types.InlineKeyboardMarkup()
    button = types.InlineKeyboardButton('Open Job Board', web_app=types.WebAppInfo(url=WEB_APP_URL))
    keyboard.add(button)
    await message.answer("Нажмите кнопку ниже, чтобы открыть веб-приложение:", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
