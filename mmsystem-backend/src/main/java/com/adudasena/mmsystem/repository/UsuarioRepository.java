package com.adudasena.mmsystem.repository;

import com.adudasena.mmsystem.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findByDeletedAtIsNull();
    Optional<Usuario> findByIdAndDeletedAtIsNull(Long id);
}