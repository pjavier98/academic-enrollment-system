# Use Cases:

## Use Case 01
O aluno só pode se matricular em disciplinar do departamento ao qual seu curso pertence

#### Precisaremos criar 2 departamentos:
* Departamento => IC => Instituto de Computação
* Departamento => IM => Instituto de Matemática

#### Cada departamento terá duas secretarias => (graduação e pós-graduação)

## Use Case 02
A matrícula so deve ser concretizada se o aluno cumpriu o número de crédito mínimo

#### Tentar cadastrar um aluno tipo P2 sem ter pago P1

## Use Case 03
O aluno não pode se matrícular em matérias que ele já tenha cursado e passado

#### Caso já tenha pago P1, não poderá pagar novamente

## Use Case 04
A matrícula so deve ser concretizada se o aluno já pagou as matérias de pre-requisito

#### Para se cadastrar em P2 deverá ter pago P1

## Use Case 05
O aluno de graduação pode se matricular em materias de pos-graduação somente se tiver completado
pelo menos 170 créditos

##### Deveremos ter matérias de Graduação:
* PAA: => só poderá se cadastrar caso tenha completado pelo menos 170 créditos

## Use Case 06
Os alunos de pós-graduação não podem cursar disciplinas de graduação

##### Alunos de pós-graduação se matriculando em P1 não poderá ser permitido

# Consultas do sistema:

## Consulta 01:
Uma lista por secretaria (graduação e pós-graduação) com os códigos, números
de créditos, os códigos dos pré-requisitos, os números de créditos mínimos e os
nomes das disciplinas que estão sendo oferecidas neste período por cada
departamento.

## Consulta 02:
Dada uma disciplina, deseja-se uma pauta da mesma, ou seja, uma lista
contendo o código, número de créditos, os códigos dos pré-requisitos, o
número de créditos mínimo e o nome da disciplina. Além disso devem ser
apresentados, o nome do professor responsável e a lista de alunos matriculados
na disciplina, com os seus nomes e números de matrícula.

## Consulta 03:
Dado um aluno, deseja-se um comprovante de matrícula, ou seja, uma lista com
o seu nome e número de matrícula, e com os códigos e nomes das disciplinas
nas quais o aluno está matriculado.