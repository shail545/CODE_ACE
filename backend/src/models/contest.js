const mongoose = require('mongoose');
const {Schema} = mongoose;

const contest = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    difficulty:{
        type:String,
        enum:['easy','medium','hard'],
        required:true,
    },
    tags:{
        type:String,
        enum:['array','linkedList','graph','dp'],
        required:true
    },
    visibleTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            },
            explanation:{
                type:String,
                required:true
            }
        }
    ],

    hiddenTestCases:[
        {
            input:{
                type:String,
                required:true,
            },
            output:{
                type:String,
                required:true,
            }
        }
    ],

    startCode: [
        {
            language:{
                type:String,
                required:true,
            },
            initialCode:{
                type:String,
                required:true
            }
        }
    ],

    referenceSolution:[
        {
            language:{
                type:String,
                required:true,
            },
            completeCode:{
                type:String,
                required:true
            }
        }
    ],
    problemType:{
        type:String,
        required:true,
    },
    problemCreator:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:true
    }

})


const Contest = mongoose.model('contest',contest);

module.exports = Contest;






// {
//   "title": "Sum of Two Numbers",
//   "description": "Given two integers a and b, return their sum.",
//   "difficulty": "easy",
//   "tags": "array",
//   "visibleTestCases": [
//     {
//       "input": "2 3",
//       "output": "5\n",
//       "explanation": "2 + 3 = 5"
//     },
//     {
//       "input": "-4 9",
//       "output": "5\n",
//       "explanation": "-4 + 9 = 5"
//     }
//   ],
//   "hiddenTestCases": [
//     {
//       "input": "100 200",
//       "output": "300\n"
//     },
//     {
//       "input": "-150 -350",
//       "output": "-500\n"
//     }
//   ],
//   "startCode": [
//     {
//       "language": "javascript",
//       "initialCode": "function sum(a, b) {\n  // TODO: implement the function\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(' ').map(Number);\nconst [a, b] = input;\n\nconsole.log(sum(a, b));"
//     },
//     {
//       "language": "cpp",
//       "initialCode": "#include <iostream>\nusing namespace std;\n\nint sum(int a, int b) {\n    // TODO: implement the function\n}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << sum(a, b) << endl;\n    return 0;\n}"
//     },
//     {
//       "language": "java",
//       "initialCode": "import java.util.Scanner;\n\npublic class Main {\n    public static int sum(int a, int b) {\n        // TODO: implement the function\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(sum(a, b));\n    }\n}"
//     }
//   ],
//   "referenceSolution": [
//     {
//       "language": "javascript",
//       "completeCode": "function sum(a, b) {\n  return a + b;\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split(' ').map(Number);\nconst [a, b] = input;\n\nconsole.log(sum(a, b));"
//     },
//     {
//       "language": "cpp",
//       "completeCode": "#include <iostream>\nusing namespace std;\n\nint sum(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << sum(a, b) << endl;\n    return 0;\n}"
//     },
//     {
//       "language": "java",
//       "completeCode": "import java.util.Scanner;\n\npublic class Main {\n    public static int sum(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int a = sc.nextInt();\n        int b = sc.nextInt();\n        System.out.println(sum(a, b));\n    }\n}"
//     }
//   ],
//   "problemType": "Normal",
//   "problemCreator": "64e49c3d0c06cd37c2d3d2c0"
// }
