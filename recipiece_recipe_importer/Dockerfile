FROM python:3.12-alpine

WORKDIR /home
COPY . .

RUN pip install --no-cache-dir --upgrade pip && pip install -r requirements.txt

CMD ["fastapi", "dev", "src/main.py", "--host", "0.0.0.0", "--port", "8081"]
