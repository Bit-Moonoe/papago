// Node.js, Express FW를 활용하여 간단한 Backend 서버 구성

const express = require('express'); // express 패키지 import

const dotenv = require('dotenv'); // 파파고 번역 및 언어감지 url 숨김 기능
dotenv.config();

const app = express();

const cilentId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const request = require('request');

//express의 static 미들웨어를 활용해야한다.
app.use(express.static('public')); // express한테 static 파일들의 경로가 어디에 있는지 명시

// express의 json 미들웨어 활용
app.use(express.json()); //express야 json 모델 쓸거야 라는 의미.



//일반적으로 /를 root 경로라고 함
//root url: 127.0.0.1:3000/
// IP주소:127.0.0.1, Port: 3000
// 126.0.0.1의 Domain name : localhost -> http://localhost:3000
// app.get() -> 첫번째 인수로 지정한 경로로 클라이언트로부터 요청(request)이 들어왔을대
// 두번쨰 인수로 작성된 콜백함수가 호출되면서 동작함.Domain
// 그 콜백함수는 2개의 인수(args)를 받음, 1. request(줄여서 req), response(res)
// HttpServletRequest, HttpServletResponse정도 개념

app.get('/', (req, res)=>{
    // res.send('응답 완료');
    // root url, 즉 메인 페이지로 접속했을 때, 우리가 만든 Node 서버는 papago의 메인 화면인 public/index.html을 응답해줘야 함.
    res.sendFile('index.html');

});

//localhost:3000/detectLangs 경로로 요청했을 때
app.post('/detectLangs',(req,res)=>{
    console.log('/detectLangs로 요청됨');
    //request.getParameter('name'); 서블릿에서 썻던 내용을 기억하자.
    console.log(req.body);

    //text 프로퍼티에 있는 값을 query라는 이름의 변수에 담고 싶고, targetLanguage는 그 이름 그대로 동일한 이름의 변수로 담고 싶음.

    const {text: query, targetLanguage, } =req.body;
    console.log(query, targetLanguage);

    const url = 'https://openapi.naver.com/v1/papago/detectLangs'; // 택배를 보낼 주소

    const options = { // options: 택배를 보낼 물건
        url,
        form: {query},
        headers: {
            'X-Naver-Client-Id': cilentId,
            'X-Naver-Client-Secret': clientSecret,

        },

    };

    
    //실제 언어감지 서비스 요청 부분
    //options라는 변수에 요청 전송 시 필요한 데이터 및 보낼 주소를 동봉한다(enclose)
    //() => {}; 요청에 따른 응답 정보를 확인하는 부분
    request.post(options, (error, response, body)=>{
        if(!error && response.statusCode ===200){ // 응답이 성공적으로 완료되었을 경우
            // console.log(body);
            // body를 parsing 처리
            const paresdData = JSON.parse(body); // {"langCode": "ko"}


            //papago 번역 url('/translate')로 redirect(요청 재지정)
            res.redirect(`translate?lang=${paresdData['langCode']}&targetLanguage=${targetLanguage}&query=${query}`)

        } else{ // 응답이 실패했을 경우
            console.log(`error = ${response.statusCode}`);
        }
    });

});

//papago 번역 요청 부분
app.get('/translate', (req,res) => {
    // const {text: query, targetLanguage, sourceLanguage: lang} =req.body;
    // console.log(lang, targetLanguage, query);

    const url = 'https://openapi.naver.com/v1/papago/n2mt';
    console.log(req.query);

    const options = { // options: 택배를 보낼 물건
        url,
        form: {
            source: req.query.lang, // 원본 언어 코드
            target: req.query.targetLanguage, //번역하고자 하는 코드
            text: req.query.query, // 번역하고자 하는 텍스트

        },
        headers: {
            'X-Naver-Client-Id': cilentId,
            'X-Naver-Client-Secret': clientSecret,

        },

    };

    //실제 번역 요청 전송부분
    request.post(options, (error, response, body)=>{
        if(!error && response.statusCode ===200){ // 응답이 성공적으로 완료되었을 경우
            res.send(body);
            // const data = JSON.parse(body); // {"langCode": "ko"}
            // res.json(data); // front에 해당하는 app.js에 papago로부터 받은 응답 데이터(body)를
            // json 형태로 parsing 해서 전송시켜줌
            // -> res.json(): stringify()가 적용된 메서드



        } 
    });
});


//서버가 실행되었을 때 몇 번 포트에서 실행시킬 것인지 확인
app.listen(3000, ()=>console.log('http://127.0.0.1:3000/ app listening on port 3000'));

//Node.js 기반의 js 파일 실행 시에는 node로 시작하는 명령어에 파일명까지 작성하면 된다.
//ex) node server.js => 노드야 server.js 파일 좀 실행해줘
//  이 맥락에서는 server.js는 express fw로 구성한 백엔드 서버 실행 코드가 담겨있음.
