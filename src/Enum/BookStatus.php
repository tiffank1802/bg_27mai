<?php

namespace App\Enum;
enum BookStatus: String 
{
    case Available = 'available' ;
    case Borrowed  = 'borrowed' ;
    case Unavailable = 'unavailable';

    public function getLabel() : String {
        return match($this) {
            self::Available => 'Disponible',
            self::Borrowed => 'Emprunté',
            self::Unavailable => 'Indisponible' 
        };
    }


}