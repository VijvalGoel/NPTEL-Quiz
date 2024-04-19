const Question = ({ question, dispatch, userAnswer }) => {
    return (
        <div>
            <h4>{question.question}</h4>
            <div className="options">
                {question.options.map((option, i) => (
                    <button
                        className={`btn btn-option ${
                            userAnswer &&
                            `${
                                question.correctOption === i
                                    ? "correct"
                                    : "wrong"
                            }`
                        }
               ${i === userAnswer - 1 && "answer"}`}
                        disabled={userAnswer}
                        onClick={() =>
                            dispatch({ type: "submitAns", payload: i })
                        }
                        key={i}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Question;
