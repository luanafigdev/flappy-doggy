# Flappy Doggy 🐶

Jogo arcade para navegador, inspirado na mecânica de desviar de obstáculos. Controle um cachorrinho (Dudu), passe pelos obstáculos, colete ossos e tente superar seu recorde.

**[Jogar online](https://flappydoggy.netlify.app/)**

## Funcionalidades

- Jogo desenvolvido com **HTML, CSS e JavaScript**, renderizado com **Canvas 2D**.
- Personagem animado por sequências de imagens.
- Obstáculos gerados durante a partida, com colisões e pontuação.
- Coleta de ossos com contador próprio.
- **10 cenários temáticos** com transições baseadas na pontuação da partida.
- Aumento gradual da velocidade dos obstáculos.
- Melhor pontuação salva no navegador com `localStorage`.
- Controles por teclado e toque na tela.

## Como jogar

- **Computador:** `↑` para pular; `Espaço` para iniciar/pular e reiniciar após o fim da partida.
- **Celular:** toque na tela para pular; no fim da partida, toque no botão de reinício.

## Executar localmente

Abra `index.html` no navegador. Para servir por um servidor local no VS Code, utilize a extensão Live Server ou um servidor HTTP local.

Não é necessária instalação de dependências para rodar os arquivos publicados.

## Estrutura

- `index.html`: elemento Canvas e entrada do jogo.
- `style.css`: layout e aparência do jogo.
- `game.js`: movimentação, colisões, pontuação, cenários e renderização.
- Arquivos `.png`: imagens e quadros das animações do personagem.
- Arquivos `.mp3`: efeitos sonoros incluídos na versão exportada.



## Autoria

Desenvolvido por Luana Figueiredo.
