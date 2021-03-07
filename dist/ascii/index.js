"use strict";
/*eslint-disable */
/**
 *
 * Ascii module
 *
 *

   _/    _/  _/_/_/      _/_/    _/      _/  _/_/_/    _/_/
  _/    _/  _/    _/  _/    _/  _/_/    _/    _/    _/    _/
 _/    _/  _/_/_/    _/_/_/_/  _/  _/  _/    _/    _/    _/
_/    _/  _/    _/  _/    _/  _/    _/_/    _/    _/    _/
 _/_/    _/    _/  _/    _/  _/      _/  _/_/_/    _/_/

                                           _/
  _/    _/  _/  _/_/    _/_/_/  _/_/_/          _/_/
 _/    _/  _/_/      _/    _/  _/    _/  _/  _/    _/
_/    _/  _/        _/    _/  _/    _/  _/  _/    _/
 _/_/_/  _/          _/_/_/  _/    _/  _/    _/_/

   _/    _/                                _/
  _/    _/  _/  _/_/    _/_/_/  _/_/_/          _/_/
 _/    _/  _/_/      _/    _/  _/    _/  _/  _/    _/
_/    _/  _/        _/    _/  _/    _/  _/  _/    _/
 _/_/    _/          _/_/_/  _/    _/  _/    _/_/

   ___  ___  ________  ________  ________   ___  ________
  |\  \|\  \|\   __  \|\   __  \|\   ___  \|\  \|\   __  \
  \ \  \\\  \ \  \|\  \ \  \|\  \ \  \\ \  \ \  \ \  \|\  \
   \ \  \\\  \ \   _  _\ \   __  \ \  \\ \  \ \  \ \  \\\  \
    \ \  \\\  \ \  \\  \\ \  \ \  \ \  \\ \  \ \  \ \  \\\  \
     \ \_______\ \__\\ _\\ \__\ \__\ \__\\ \__\ \__\ \_______\
      \|_______|\|__|\|__|\|__|\|__|\|__| \|__|\|__|\|_______|


    ***** *    **        ***** ***          **             ***** *     **            *****  *       * ***
  ******  *  *****     ******  * **       *****          ******  **    **** *      ******  *       *  ****
 **   *  *     *****  **   *  *  **      *  ***         **   *  * **    ****      **   *  *       *  *  ***
*    *  **     * **  *    *  *   **         ***        *    *  *  **    * *      *    *  *       *  **   ***
    *  ***     *         *  *    *         *  **           *  *    **   *            *  *       *  ***    ***
   **   **     *        ** **   *          *  **          ** **    **   *           ** **      **   **     **
   **   **     *        ** **  *          *    **         ** **     **  *           ** **      **   **     **
   **   **     *        ** ****           *    **         ** **     **  *         **** **      **   **     **
   **   **     *        ** **  ***       *      **        ** **      ** *        * *** **      **   **     **
   **   **     *        ** **    **      *********        ** **      ** *           ** **      **   **     **
    **  **     *        *  **    **     *        **       *  **       ***      **   ** **       **  **     **
     ** *      *           *     **     *        **          *        ***     ***   *  *         ** *      *
      ***      *       ****      ***   *****      **     ****          **      ***    *           ***     *
       ********       *  ****    **   *   ****    ** *  *  *****                ******             *******
         ****        *    **     *   *     **      **  *     **                   ***                ***
                     *               *                 *
                      **              **                **

     ##### /    ##       ##### /##        ##            ##### #     ##        #####  #  # ###
  ######  /  #####    ######  / ##     /####         ######  /#    #### /  ######  /  /  /###
 /#   /  /     ##### /#   /  /  ##    /  ###        /#   /  / ##    ###/  /#   /  /  /  /  ###
/    /  ##     # ## /    /  /   ##       /##       /    /  /  ##    # #  /    /  /  /  ##   ###
    /  ###     #        /  /    /       /  ##          /  /    ##   #        /  /  /  ###    ###
   ##   ##     #       ## ##   /        /  ##         ## ##    ##   #       ## ## ##   ##     ##
   ##   ##     #       ## ##  /        /    ##        ## ##     ##  #       ## ## ##   ##     ##
   ##   ##     #       ## ###/         /    ##        ## ##     ##  #     /### ## ##   ##     ##
   ##   ##     #       ## ##  ###     /      ##       ## ##      ## #    / ### ## ##   ##     ##
   ##   ##     #       ## ##    ##    /########       ## ##      ## #       ## ## ##   ##     ##
    ##  ##     #       #  ##    ##   /        ##      #  ##       ###  ##   ## ##  ##  ##     ##
     ## #      #          /     ##   #        ##         /        ### ###   #  /    ## #      /
      ###      /      /##/      ### /####      ##    /##/          ##  ###    /      ###     /
       #######/      /  ####    ## /   ####    ## / /  #####            #####/        ######/
         ####       /    ##     # /     ##      #/ /     ##               ###           ###
                    #             #                #
                     ##            ##               ##

                                   _/
_//  _//_/ _///   _//    _// _//        _//
_//  _// _//    _//  _//  _//  _//_// _//  _//
_//  _// _//   _//   _//  _//  _//_//_//    _//
_//  _// _//   _//   _//  _//  _//_// _//  _//
  _//_//_///     _// _///_///  _//_//   _//


_//     _//_///////          _/       _///     _//_//    _////
_//     _//_//    _//       _/ //     _/ _//   _//_//  _//    _//
_//     _//_//    _//      _/  _//    _// _//  _//_//_//        _//
_//     _//_/ _//         _//   _//   _//  _// _//_//_//        _//
_//     _//_//  _//      _////// _//  _//   _/ _//_//_//        _//
_//     _//_//    _//   _//       _// _//    _/ //_//  _//     _//
  _/////   _//      _//_//         _//_//      _//_//    _////

                              __
 __  __  _ __    __      ___ /\_\    ___
/\ \/\ \/\`'__\/'__`\  /' _ `\/\ \  / __`\
\ \ \_\ \ \ \//\ \L\.\_/\ \/\ \ \ \/\ \L\ \
 \ \____/\ \_\\ \__/.\_\ \_\ \_\ \_\ \____/
  \/___/  \/_/ \/__/\/_/\/_/\/_/\/_/\/___/


 __  __  ____    ______  __  __  ______   _____
/\ \/\ \/\  _`\ /\  _  \/\ \/\ \/\__  _\ /\  __`\
\ \ \ \ \ \ \L\ \ \ \L\ \ \ `\\ \/_/\ \/ \ \ \/\ \
 \ \ \ \ \ \ ,  /\ \  __ \ \ , ` \ \ \ \  \ \ \ \ \
  \ \ \_\ \ \ \\ \\ \ \/\ \ \ \`\ \ \_\ \__\ \ \_\ \
   \ \_____\ \_\ \_\ \_\ \_\ \_\ \_\/\_____\\ \_____\
    \/_____/\/_/\/ /\/_/\/_/\/_/\/_/\/_____/ \/_____/


#   # ####    #   #   # #   #  ###
 # #  #   #  # #  #   # #  ## #   #
  #   ####  ##### ##### # # # #   #
 #    #     #   # #   # ##  # #   #
#     #     #   # #   # #   #  ###

                            _____
____  ______________ __________(_)_____
_  / / /_  ___/  __ `/_  __ \_  /_  __ \
/ /_/ /_  /   / /_/ /_  / / /  / / /_/ /
\__,_/ /_/    \__,_/ /_/ /_//_/  \____/

 */
//# sourceMappingURL=index.js.map