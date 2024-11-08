FROM python:alpine

WORKDIR /home
COPY . .

RUN pip install "fastapi[standard]" && pip install -r requirements.txt

CMD ["fastapi", "dev", "src/main.py"]
