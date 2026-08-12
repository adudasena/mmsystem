package com.adudasena.mmsystem.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private String nome;
    private String telefone;
    private String email;
    private String senha;
    private String perfil;
}