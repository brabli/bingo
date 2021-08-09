class BingoBoard {
    constructor(squares) {

        if (squares.length !== 16) {
            throw new Error("Squares array must contain 16 items!");
        }

        this.squareText = squares;

        this.fakeSquareText = [];

        this.bingoSquares = document.querySelectorAll('.bingo-square');
        this.bingoCounterLabel = document.querySelector('.bingo-counter');
        this.bingoCounter = document.querySelector('.count');
        this.resetButton = document.querySelector('.reset-button');
        this.fullHouse = false;
        this.totalBingos = 0;

        this.rows = [
            document.querySelectorAll('.row-a'),
            document.querySelectorAll('.row-b'),
            document.querySelectorAll('.row-c'),
            document.querySelectorAll('.row-d')
        ];

        this.cols =[
            document.querySelectorAll('.col-a'),
            document.querySelectorAll('.col-b'),
            document.querySelectorAll('.col-c'),
            document.querySelectorAll('.col-d'),
        ]

        this.diags = [
            document.querySelectorAll('.diag-a'),
            document.querySelectorAll('.diag-b')
        ]

        this.bingoSquares.forEach(ele => {
            ele.addEventListener('click', () => {
                ele.classList.toggle('active');
                // Reset totalBingos as it's recalculated inside next method calls.
                this.totalBingos = 0;
                // Bingo counter is increased inside these method calls.
                this._checkLinesForBingo(this.rows, "row");
                this._checkLinesForBingo(this.cols, "col");
                this._checkLinesForBingo(this.diags, "diag");
                this.bingoCounter.textContent = this.totalBingos;
                this._checkForFullHouse();
                if (this.fullHouse) {
                    const buzzer = new Audio('assets/buzzer.mp3');
                    buzzer.play();
                }
            });
        });

        this._populateSquareText(this.squareText);

        this.resetButton.addEventListener('click', () => {
            this._resetAll();
        });

        this.bingoCounterLabel.addEventListener('click', () => {
            this.bingoCounterLabel.classList.toggle('fake');
            if (this.bingoCounterLabel.classList.contains('fake')) {
                this._populateSquareText(this.fakeSquareText);
            } else {
                this._populateSquareText(this.squareText);
            }
        })
    }

    _populateSquareText(textList) {
        this.bingoSquares.forEach((ele, i) => {
            ele.textContent = textList[i];
        })
    }

    _checkLinesForBingo(lines, name) {
        lines.forEach(line => {
            line = Array.from(line);
            const isBingo = line.every(square => square.classList.contains('active'));
            if (isBingo) {
                line.forEach(square => square.classList.add(`${name}-bingo`));
                this.totalBingos++;
            } else {
                line.forEach(square => {
                    square.classList.remove(`${name}-bingo`);
                })
            }
        })
    }

    _checkForFullHouse() {
        const bingoSquares = Array.from(this.bingoSquares);
        const allActive = bingoSquares.every(square => square.classList.contains('active'));
        if (allActive) {
            this.fullHouse = true;
        } else {
            this.fullHouse = false;
        }
    }

    _resetAll() {
        const bingoSquares = Array.from(this.bingoSquares);
        bingoSquares.forEach(square => square.classList.remove('active'));
        bingoSquares.forEach(square => square.classList.remove('row-bingo'));
        bingoSquares.forEach(square => square.classList.remove('col-bingo'));
        bingoSquares.forEach(square => square.classList.remove('diag-bingo'));
        this.totalBingos = 0;
        this.bingoCounter.textContent = 0;
    }
}

export default BingoBoard;
