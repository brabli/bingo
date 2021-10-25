class BingoBoard {
    constructor(bingoSquareContents = [], badSquareContents = [], fakeBingoContents = []) {

        if (bingoSquareContents.length !== 16) {
            throw new Error("Squares array must contain 16 items!");
        }

        this.storage = window.localStorage;

        this.squareText = bingoSquareContents;
        this.fakeSquareText = fakeBingoContents;
        this.badSquareText = badSquareContents;

        this.bingoContainer = document.querySelector('.bingo-container');
        this.bingoSquares = document.querySelectorAll('.bingo-square');
        this.goodSquares = document.querySelectorAll('.bingo-square:not(.bad-square)');
        this.badSquares = document.querySelectorAll('.bad-square');
        this.badSquaresContainer = document.querySelector('.bad-squares-container');
        this.bingoCounterLabel = document.querySelector('.bingo-counter');
        this.bingoCounter = document.querySelector('.count');
        this.resetButton = document.querySelector('.reset-button');
        this.editButton = document.querySelector('.edit-button');
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
            ele.addEventListener('click', event => {
                this._bingoSquareListener(ele, event);
            });
        });

        this._populateSquareText(this.squareText, this.badSquareText);

        this.resetButton.addEventListener('click', () => {
            this._resetAll();
        });

        this.bingoCounterLabel.addEventListener('click', () => {
            this._toggleFakeBingo();
        });

        this.editButton.addEventListener('click', () => {
            this._toggleEditMode();
        })

        this._restore();
    }

    _bingoSquareListener(ele, event) {
        // Early return for edit mode. This should be a data attribute 2bh.
        if (ele.classList.contains('being-edited')) return;
        ele.classList.toggle('active');
        this._updateStorage();
        this._checkForDeath();
        // Reset totalBingos as it's recalculated inside next method calls.
        this.totalBingos = 0;
        // Bingo counter is increased inside these method calls.
        this._checkLinesForBingo(this.rows, "row");
        this._checkLinesForBingo(this.cols, "col");
        this._checkLinesForBingo(this.diags, "diag");
        this.bingoCounter.textContent = this.totalBingos;
        // If this square is'nt a bad square check for full house. Just have seperate listeners?
        if (!event.target.classList.contains('bad-square')) {
            this._checkForFullHouse();
            if (this.fullHouse) {
                const audioUrl = require('../assets/audio/buzzer.mp3');
                const buzzer = new Audio(audioUrl);
                buzzer.play();
            }
        }
    }

    _restore() {
        if (this.storage.getItem('activeSquares')) {
            const squareStates = JSON.parse(this.storage.getItem('activeSquares'));
            this.bingoSquares.forEach((square, i) => {
                if (squareStates[i]) {
                    square.classList.add('active');
                }
            });
        }
        if (this.storage.getItem('goodTextContent') && this.storage.getItem('badTextContent')) {
            this._populateSquareText(
                JSON.parse(this.storage.getItem('goodTextContent')),
                JSON.parse(this.storage.getItem('badTextContent'))
            );
        }

        this._checkForDeath();
        this._checkLinesForBingo(this.rows, 'row');
        this._checkLinesForBingo(this.cols, 'col');
        this._checkLinesForBingo(this.diags, 'diag');
        this._checkForFullHouse();
    }

    _toggleEditMode() {
        if (this.bingoContainer.editable === 'true') {
            this.editButton.classList.remove('active');
            this.bingoContainer.editable = 'false';
            this.bingoSquares.forEach(square => {
                square.contentEditable = 'false';
                square.classList.remove('being-edited');
            });
            this._updateStorage();
        } else {
            this.editButton.classList.add('active');
            this.bingoContainer.editable = 'true';
            this.bingoSquares.forEach(square => {
                square.contentEditable = 'true';
                square.classList.add('being-edited');
            });
        }
    }

    _updateStorage() {
        const activeSquaresStorage = [];
        const goodSquareTextStorage = [];
        const badSquareTextStorage = [];

        this.bingoSquares.forEach(square => {
            activeSquaresStorage.push(square.classList.contains('active'));
        });
        this.storage.setItem('activeSquares', JSON.stringify(activeSquaresStorage));

        this.goodSquares.forEach(square => {
            goodSquareTextStorage.push(square.textContent);
        });
        this.storage.setItem('goodTextContent', JSON.stringify(goodSquareTextStorage));

        this.badSquares.forEach(square => {
            badSquareTextStorage.push(square.textContent);
        });
        this.storage.setItem('badTextContent', JSON.stringify(badSquareTextStorage));
    }

    _toggleFakeBingo() {
        this.bingoCounterLabel.classList.toggle('fake');
        if (this.bingoCounterLabel.classList.contains('fake')) {
            this._populateSquareText(this.fakeSquareText);
            this.badSquaresContainer.classList.add('hidden');
            document.querySelector('body').classList.remove('red');
            this.bingoContainer.classList.remove('red');
        } else {
            this._populateSquareText(this.squareText, this.badSquareText);
            this.badSquaresContainer.classList.remove('hidden');
            this._checkForDeath();
        }
    }

    _checkForDeath() {
        const line = Array.from(this.badSquares);
        const isDead = line.every(square => square.classList.contains('active'));
        if (isDead) {
            document.querySelector('body').classList.add('red');
            this.bingoContainer.classList.add('red');
        } else {
            document.querySelector('body').classList.remove('red');
            this.bingoContainer.classList.remove('red');
        }
    }

    _populateSquareText(textList, badList = []) {
        this.bingoSquares.forEach((ele, i) => {
            ele.textContent = textList[i];
        });
        this.badSquares.forEach((ele, i) => {
            ele.textContent = badList[i];
        });
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
        const allBingoSquares = Array.from(this.bingoSquares);
        const bingoSquares = allBingoSquares.filter(square => !square.classList.contains('bad-square'));
        const allActive = bingoSquares.every(square => square.classList.contains('active'));
        if (allActive) {
            this.fullHouse = true;
        } else {
            this.fullHouse = false;
        }
    }

    _resetAll() {
        const bingoSquares = this.bingoSquares;
        this.storage.clear();
        bingoSquares.forEach(square => square.classList.remove('active'));
        bingoSquares.forEach(square => square.classList.remove('row-bingo'));
        bingoSquares.forEach(square => square.classList.remove('col-bingo'));
        bingoSquares.forEach(square => square.classList.remove('diag-bingo'));
        document.querySelector('body').classList.remove('red');
        this.bingoContainer.classList.remove('red');
        this.totalBingos = 0;
        this.bingoCounter.textContent = 0;
        this._populateSquareText(this.squareText, this.badSquareText);
    }
}

export default BingoBoard;
