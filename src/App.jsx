import { useEffect, useReducer } from "react";
import Error from "./Error";
import Footer from "./Footer";
import Header from "./Header";
import Home from "./Home";
import Loader from "./Loader";
import MainElement from "./MainElement";
import NextButton from "./NextButton";
import Progress from "./Progress";
import Question from "./Question";
import Results from "./Results";
import Timer from "./Timer";
import data from "../data/forests-questions.json";

const initialState = {
    questions: [],
    allQuestions: [],
    numQuestions: 50,
    status: "loading",
    index: 0,
    score: 0,
    userAnswer: null,
    highScore: JSON.parse(localStorage.getItem("highscore")),
    timeLeft: null,
};

const reducer = function (state, action) {
    switch (action.type) {
        case "changeNumQuestions":
            return {
                ...state,
                numQuestions: action.payload,
                questions: shuffleArray(state.allQuestions).slice(
                    0,
                    action.payload
                ),
            };
        case "dataRetrieved":
            return {
                ...state,
                questions: shuffleArray(action.payload).slice(0, 50),
                allQuestions: action.payload,
                status: "ready",
            };
        case "dataRetrievalFailed":
            console.log(action.payload.message);
            return { ...state, status: "error" };
        case "start":
            return {
                ...state,
                status: "start",
                timeLeft: state.questions?.length * 216,
            };
        case "next":
            if (
                state.index === state.questions?.length - 1 &&
                state.highScore < state.score
            ) {
                console.log(JSON.parse(localStorage.getItem("highscore")));
                localStorage.setItem("highscore", JSON.stringify(state.score));
                console.log(JSON.parse(localStorage.getItem("highscore")));
            }
            return state.index === state.questions?.length - 1
                ? {
                      ...state,
                      status: "end",
                      highScore:
                          state.highScore < state.score
                              ? state.score
                              : state.highScore,
                  }
                : { ...state, index: state.index + 1, userAnswer: null };
        case "submitAns": {
            let newScore = state.score;
            if (state.questions[state.index].correctOption === action.payload) {
                newScore += state.questions[state.index].points;
            }
            return {
                ...state,
                score: newScore,
                userAnswer: action.payload + 1,
            };
        }
        case "reset":
            return {
                ...initialState,
                questions: shuffleArray(state.allQuestions).slice(0, 50),
                allQuestions: state.allQuestions,
                status: "ready",
                highScore: state.highScore,
            };
        case "tick":
            if (state.timeLeft <= 0)
                return {
                    ...state,
                    status: "end",
                    highScore:
                        state.highScore < state.score
                            ? state.score
                            : state.highScore,
                };

            return {
                ...state,
                timeLeft: state.timeLeft - 1,
            };
        default:
            console.log("action does not exist");
            return state;
    }
};

const shuffleArray = (array) => {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [
            shuffledArray[j],
            shuffledArray[i],
        ];
    }

    return shuffledArray;
};

const App = () => {
    const [
        {
            questions,
            status,
            index,
            score,
            userAnswer,
            highScore,
            timeLeft,
            numQuestions,
        },
        dispatch,
    ] = useReducer(reducer, initialState);

    useEffect(function () {
        async function fetchQuestions() {
            try {
                const quesData = data.questions;
                dispatch({ type: "dataRetrieved", payload: quesData });
            } catch (err) {
                dispatch({ type: "dataRetrievalFailed", payload: err });
            }
        }
        fetchQuestions();
    }, []);

    const totalPoints = questions?.reduce(
        (rec, question) => rec + question.points,
        0
    );

    return (
        <div className="app">
            <Header />
            <MainElement>
                {status === "loading" && <Loader />}
                {status === "error" && <Error />}
                {status === "ready" && (
                    <Home numQuestions={numQuestions} dispatch={dispatch} />
                )}
                {status === "start" && (
                    <>
                        <Progress
                            numQuestions={numQuestions}
                            index={index}
                            score={score}
                            totalPoints={totalPoints}
                            userAnswer={userAnswer}
                        />
                        <Question
                            question={questions[index]}
                            userAnswer={userAnswer}
                            dispatch={dispatch}
                        />
                        <Footer>
                            <NextButton
                                userAnswer={userAnswer}
                                dispatch={dispatch}
                                index={index}
                                numQuestions={numQuestions}
                            />
                            <Timer timeLeft={timeLeft} dispatch={dispatch} />
                        </Footer>
                    </>
                )}
                {status === "end" && (
                    <Results
                        score={score}
                        totalPoints={totalPoints}
                        highScore={highScore}
                        dispatch={dispatch}
                    />
                )}
            </MainElement>
        </div>
    );
};

export default App;
