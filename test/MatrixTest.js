"use strict";

import { assert } from "chai";

import {
    Matrix,
    PRECISION,
    Vector
} from "../target/Sylvester";

describe("Matrix", function () {

    it("create", function() {
        var M = new Matrix([
            [0,3,4,8],
            [3,9,7,3]
        ])
        assert.equal( '[0, 3, 4, 8]\n[3, 9, 7, 3]', M.inspect() )
        assert.equal( '[0, 2, 7, 5]', new Matrix([[0,2,7,5]]).inspect() )
        assert.equal( '[0]\n[2]\n[7]\n[5]', new Matrix([[0],[2],[7],[5]]).inspect() )
        assert.equal( '[128]', new Matrix([[128]]).inspect() )
        assert.equal( '[]', new Matrix([]).inspect() )
    });

    it("I", function() {
        assert( Matrix.I(3).eql(new Matrix([[1,0,0],[0,1,0],[0,0,1]])) )
        assert( Matrix.I(1).eql(new Matrix([[1]])) )
        assert( Matrix.I(0).eql(new Matrix([])) )
    });

    it("e", function() {
        var M = new Matrix([
            [0,3,4,8],
            [3,9,7,3]
        ])
        assert.equal( 0, M.e(1,1) )
        assert.equal( 8, M.e(1,4) )
        assert.isNull( M.e(2,6) )
    });

    it("rows and columns", function() {
        var M = new Matrix([
            [0,3,4,8],
            [3,9,7,3]
        ])
        assert( M.row(2).eql([3,9,7,3]) )
        assert.isNull( M.row(3) )
        assert( M.col(2).eql([3,9]) )
        assert.isNull( M.col(6) )
        assert.isNull( new Matrix([]).row(1) )
        assert.isNull( new Matrix([]).col(1) )
    });

    it("dimensions", function() {
        var M = new Matrix([
            [0,3,4,8],
            [3,9,7,3]
        ])
        assert.deepEqual( 2, M.rows() )
        assert.deepEqual( 4, M.cols() )
        assert.deepEqual( [0,0], [new Matrix([]).rows(), new Matrix([]).cols()] )
        assert.deepEqual( {rows: 0, cols: 0}, new Matrix([]).dimensions() )
    });

    it("dup", function() {
        var M1 = new Matrix([
            [2,3,8],
            [7,0,2],
            [6,3,0]
        ])
        var M2 = M1.dup()
        assert( M1.eql(M2) )
        M2.elements[1][1] = 99
        assert.isNotOk( M1.eql(M2) )
        assert.equal( 0, M1.elements[1][1] )
    });

    it("eql", function() {
        var M = new Matrix([
            [2,3,8],
            [7,0,2],
            [6,3,0]
        ])
        assert( M.eql([[2,3,8],  [7,0,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[7,3,8],  [7,0,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,7,8],  [7,0,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,3,7],  [7,0,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [8,0,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [7,7,2],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [7,0,7],  [6,3,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [7,0,2],  [7,3,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [7,0,2],  [6,7,0]]) )
        assert.isNotOk( M.eql([[2,3,8],  [7,0,2],  [6,3,7]]) )
    });

    it("map", function() {
        assert(
            new Matrix([
                [2,3,8],
                [7,0,2],
                [6,3,0]
            ]).map(function(x, i, j) { return x + j }).eql([
                [3,5,11],
                [8,2,5],
                [7,5,3]
            ])
        )
    });

    it("Random", function() {
        var M
        for (var i = 1; i < 5; i++) {
            M = Matrix.Random(4,i)
            assert.equal( 4, M.rows() )
            assert.equal( i, M.cols() )
            M = Matrix.Random(i,3)
            assert.equal( i, M.rows() )
            assert.equal( 3, M.cols() )
        }
    });

    it("Zero", function() {
        var M
        for (var i = 1; i < 5; i++) {
            M = Matrix.Random(5,i)
            assert.equal( 5, M.rows() )
            assert.equal( i, M.cols() )
            M = Matrix.Random(i,2)
            assert.equal( i, M.rows() )
            assert.equal( 2, M.cols() )
        }
        assert( Matrix.Random(0,0).eql(new Matrix([])) )
    });

    it("isSameSizeAs", function() {
        assert( Matrix.Random(2,5).isSameSizeAs(Matrix.Zero(2,5)) )
        assert.isNotOk( Matrix.Random(2,6).isSameSizeAs(Matrix.Zero(2,5)) )
        assert.isNotOk( Matrix.Random(1,5).isSameSizeAs(Matrix.Zero(2,5)) )
    });

    it("arithmetic", function() {
        var M1 = new Matrix([
            [2,5,9,3],
            [9,2,8,5]
        ])
        var M2 = new Matrix([
            [7,1,0,8],
            [0,4,3,8]
        ])
        var M = new Matrix([
            [9,6,   9,11],
            [9,6.0,11,13]
        ])
        assert( M1.add(M2).eql(M) )
        assert( M2.add(M1).eql(M) )
        assert.isNull( M1.add(Matrix.Zero(2,5)) )
        M = new Matrix([
            [-5,4,9.0,-5],
            [9,-2,5,-3]
        ])
        assert( M1.subtract(M2).eql(M) )
        assert( M2.subtract(M1).eql(M.x(-1)) )
        assert.isNull( M1.subtract(Matrix.Zero(2,7)) )
        assert(M2.x(3).eql([
            [21,3,0,24],
            [0,12,9,24]
        ]))
    });

    it("multiplication", function() {
        var M1 = new Matrix([
            [2,5,9,3],
            [9,2,8,5]
        ])
        var M2 = new Matrix([
            [2,9],
            [0,2],
            [8,1],
            [0,6]
        ])
        assert.equal( 2, M1.x(M2).rows() )
        assert.equal( 2, M1.x(M2).cols() )
        assert(M1.x(M2).eql([
            [76, 55],
            [82, 123]
        ]))
        assert.equal( 4, M2.x(M1).rows() )
        assert.equal( 4, M2.x(M1).cols() )
        assert.isNull( M1.x(M1.x(M2)) )
        assert.isNotNull( M1.x(M2.x(M1)) )
    });

    it("minor", function() {
        var M2 = new Matrix([
            [2,9],
            [0,2],
            [8,1],
            [0,6]
        ])
        var M = new Matrix([
            [9,2,9],
            [2,0,2],
            [1,8,1]
        ])
        assert( M2.minor(1,2,3,3).eql(M) )
    });

    it("isSquare", function() {
        assert( Matrix.Zero(9,9).isSquare() )
        assert.isNotOk( Matrix.Zero(4,9).isSquare() )
        assert.isNotOk( Matrix.Zero(9,3).isSquare() )
        assert( new Matrix([]).isSquare() )
    });

    it("max and index", function() {
        var M = new Matrix([
            [2,5,9,3],
            [9,2,8,5]
        ])
        assert.equal( 9, M.max() )
        assert( M.indexOf(8).i == 2 && M.indexOf(8).j == 3 )
        assert( M.indexOf(9).i == 1 && M.indexOf(9).j == 3 )
    });

    it("diagonal", function() {
        var M = new Matrix([
            [9,2,9],
            [2,0,2],
            [1,8,1]
        ])
        assert( M.diagonal().eql([9,0,1]) )
    });

    //TODO No idea why this fails ...
    /*
    it("toRightTriangular", function() {
        for (var i = 0, M; i < 8; i++) {
            M = Matrix.Random(3,3);
            assert.match( /^\[[0-9\-\.]+, [0-9\-\.]+, [0-9\-\.]+\]\n\[0, [0-9\-\.]+, [0-9\-\.]+\]\n\[0, 0, [0-9\-\.]+\]$/,
                                     M.toRightTriangular().inspect() )
        }
    });
    */

    it("transpose", function() {
        var M1 = new Matrix([
            [3,9,8,4],
            [2,0,1,5]
        ])
        var M2 = new Matrix([
            [3,2],
            [9,0],
            [8,1],
            [4,5]
        ])
        assert( M1.transpose().eql(M2) )
        assert( M2.transpose().eql(M1) )
    });

    it("determinant", function() {
        for (var i = 0, M; i < 5; i++) {
            M = Matrix.Random(3,3).x(10).elements
            assert(
                M[0][0] * (M[1][1]*M[2][2] - M[1][2]*M[2][1]) +
                M[0][1] * (M[1][2]*M[2][0] - M[1][0]*M[2][2]) +
                M[0][2] * (M[1][0]*M[2][1] - M[1][1]*M[2][0]) -
                new Matrix(M).determinant()
                < PRECISION
            )
        }
        assert.isNull( Matrix.Random(3,4).determinant() )
        assert.equal( 1, new Matrix([]).det() )
    });

    it("isSingular", function() {
        var M = Matrix.Random(3,3).x(10)
        M.elements[0][0] = M.elements[1][0] = M.elements[2][0] = 0
        assert( M.isSingular() )
        assert.isNotOk( Matrix.Zero(4,3).isSingular() )
    });

    it("trace", function() {
        var M = new Matrix([
            [8,1,6],
            [0,1,7],
            [0,1,5]
        ])
        assert.equal( 14, M.tr() )
        assert.isNull( Matrix.Random(4,5).tr() )
    });

    it("rank", function() {
        var M = new Matrix([
            [1,9,4,6],
            [9,2,7,4],
            [18,4,14,8]
        ])
        assert.equal( 2, M.rk() )
    });

    it("augment", function() {
        assert(new Matrix([
            [7,2,9,4],
            [4,8,2,6],
            [9,2,5,6]
        ]).augment([
            [4,6],
            [5,2],
            [8,2]
        ]).eql([
            [7,2,9,4,4,6],
            [4,8,2,6,5,2],
            [9,2,5,6,8,2]
        ]))
    });

    it("inverse", function() {
        for (var i = 0, M; i < 10; i++) {
            M = Matrix.Random(4,4).x(5)
            if (M.isSingular()) { continue; }
            assert( M.x(M.inv()).eql(Matrix.I(4)) )
            assert( M.inv().x(M).eql(Matrix.I(4)) )
        }
        assert( new Matrix([[4]]).inv().eql(new Matrix([[0.25]])) )
    });

    it("Rotation", function() {
        assert(Matrix.Rotation(Math.PI/2).eql([
            [0,-1], [1,0]
        ]))
        assert(Matrix.Rotation(Math.PI/2, Vector.j).eql([
            [0,0,1],
            [0,1,0],
            [-1,0,0]
        ]))
    });

    it("Diagonal", function() {
        assert(Matrix.Diagonal([3,9,5,7]).eql([
            [3,0,0,0],
            [0,9,0,0],
            [0,0,5,0],
            [0,0,0,7]
        ]))
    });
});